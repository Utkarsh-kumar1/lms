import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import path from 'path';
import fs from 'fs';

export async function GET(req, { params }) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
    }

    const filePath = params.fileName;
    // const filePath = path.join(process.cwd(), 'uploads', fileName);

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
                'Content-Disposition': `inline; filename="${filePath}"`
            },
        });
    } catch (error) {
        return NextResponse.json({ message: 'Error reading file' }, { status: 500 });
    }
}
