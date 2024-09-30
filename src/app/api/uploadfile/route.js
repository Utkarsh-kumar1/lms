import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import ApiResponse from '@/helpers/ApiResponse';
import { v4 as uuidv4 } from 'uuid';
import dbconnect from "@/lib/dbconnect"
import { getToken } from 'next-auth/jwt';

export async function POST(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    if(!token)
    {
        return NextResponse.json(ApiResponse.error(400, 'Unauthorized Access'), { status: 400 });
    }
    try {
        //type defines wheather it is for the subject or the topic


        const formData = await req.formData();
        const file = formData.get('file');
        const type = formData.get('type');
        const typeId = formData.get('typeId');
        const courseId = formData.get('courseId');
        if (!type || !typeId || !courseId) {
            return NextResponse.json(ApiResponse.error(400, 'type and typeId is required'), { status: 400 });
        }
        if (!file) {
            return NextResponse.json(ApiResponse.error(400, 'No file uploaded'), { status: 400 });
        }
        console.log(file , type , typeId);
        

        const arrayBuffer = await file.arrayBuffer(); // Convert file to an ArrayBuffer
        const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Buffer

        const uploadDir = path.join(process.cwd(), '/uploads');
        await fs.mkdir(uploadDir, { recursive: true });

        // Generate a unique file name by using uuid
        const uniqueFileName = uuidv4()+ "_"+file.name
        const filePath = path.join(uploadDir, uniqueFileName);

        await fs.writeFile(filePath, buffer); // Save the file to the uploads folder

        const pool = dbconnect()

        const savedData = await pool.execute(`Insert into notes(topic , subjectRef , fileName , fileType , filePath , fileSize) values (?,?,?,?,?,?)` , [typeId ,courseId , file.name , file.type , filePath , file.size])
        console.log(savedData);
        

        return NextResponse.json({
            message: 'File uploaded successfully',
            filePath,
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json(ApiResponse.error(500, `File upload failed: ${error.message}`), { status: 500 });
    }
}
