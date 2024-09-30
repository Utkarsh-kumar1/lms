import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import path from 'path';
import fs from 'fs';
import dbconnect from "@/lib/dbconnect"


export async function GET(req, { params }) {
    const { topicId, fileName  } = params;
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
    }

    const pool = dbconnect()

    const [data ] = await pool.execute("SELECT * FROM topic_notes WHERE userId = ? and topicId = ?" , [token.id , topicId])
    // console.log(data);

    const {notes} = data[0]

    const notesData = JSON.parse(notes);
    let fileData ;

    notesData.forEach(note => {
        if(note.filePath == fileName)
        {
            fileData = note
            return;
        }
    });

    // [{ "fileName": "Module+2+Homework.pdf", "fileType": "application/pdf", "filePath": "/home/deepansh/new_lms/lms/uploads/b2cf48e8-77ef-4b74-9899-f0761ca57e0c_Module+2+Homework.pdf", "fileSize": 136852 }]
    

    // Define the path to the file
    const filePath = path.join(process.cwd(), 'uploads',fileData.filePath);

    try {
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ message: 'File not found' }, { status: 404 });
        }

        const stat = fs.statSync(filePath);
        const fileStream = fs.createReadStream(filePath);

        // Determine content type based on file extension
        const extname = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream'; // Default

        switch (extname) {
            case '.pdf':
                contentType = 'application/pdf';
                break;
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.gif':
                contentType = 'image/gif';
                break;
            case '.txt':
                contentType = 'text/plain';
                break;
            case '.html':
                contentType = 'text/html';
                break;
            // Add more cases for different file types as needed
        }

        return new NextResponse(fileStream, {
            headers: {
                'Content-Length': stat.size,
                'Content-Type': contentType,
                'Accept-Ranges': 'bytes',
                'Content-Disposition': `inline; filename="${fileName}"`,
            },
        });
    } catch (error) {
        return NextResponse.json({ message: 'Error reading file' }, { status: 500 });
    }
}
