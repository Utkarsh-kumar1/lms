import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import ApiResponse from '@/helpers/ApiResponse';
import { v4 as uuidv4 } from 'uuid';
import { getToken } from 'next-auth/jwt';
import { db } from '@/db/drizzle';
import { notes } from '@/db/schema';
import { revalidatePath } from 'next/cache';

export async function POST(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    if (!token) {
        return NextResponse.json(ApiResponse.error(400, 'Unauthorized Access'), { status: 400 });
    }
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const topicId = formData.get('topicId');
        const courseId = formData.get('courseId');
        const subjectId = formData.get('subjectId')
        console.log(formData );
        
        if (!file) {
            return NextResponse.json(ApiResponse.error(400, 'No file Found'), { status: 400 });
        }

        if (topicId && !courseId && !subjectId) {

            return NextResponse.json(ApiResponse.error(400, 'topicId , subjectId and courseId is required'), { status: 400 });
        }
        else if (courseId && !subjectId ) {

            return NextResponse.json(ApiResponse.error(400, 'topicId , subjectId and courseId is required'), { status: 400 });
        }
        else if (!subjectId) {

            return NextResponse.json(ApiResponse.error(400, 'topicId , subjectId and courseId is required'), { status: 400 });
        }




        // Check if the subject exists and belongs to the user
        const subject = await db.query.subject.findFirst({
            with: {
                courses: courseId ? {
                    with: {
                        topics: topicId ? {
                            where: (topic, { eq }) => eq(topic.id, topicId),
                        } : false
                    },
                    where: (course, { eq }) => eq(course.id, courseId)
                } : false
            },
            where: (subject, { eq, and }) => and(
                eq(subject.owner, token.id),
                eq(subject.id, subjectId)
            )
        });



        // Initialize isOwner to false
        let isOwner = false;

        // Validate ownership based on the presence of topicId, courseId, or subjectId
        if (subject) {
            // Check ownership by topicId
            if (topicId && subject.courses?.[0]?.topics?.length > 0) {
                isOwner = true;
            }
            // Check ownership by courseId
            else if (!topicId && courseId && subject.courses?.length > 0) {
                isOwner = true;
            }
            // Check ownership by subjectId
            else if (!topicId && !courseId && subjectId && subject) {
                isOwner = true;
            }
        }

        if (!isOwner) {
            return NextResponse.json(ApiResponse.error(403, 'You do not have permission to access this resource'), { status: 403 });
        }



        const arrayBuffer = await file.arrayBuffer(); // Convert file to an ArrayBuffer
        const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Buffer

        const uploadDir = path.join(process.cwd(), '/uploads');
        await fs.mkdir(uploadDir, { recursive: true });

        // Generate a unique file name by using uuid
        const uniqueFileName = uuidv4() + "_" + file.name
        const filePath = path.join(uploadDir, uniqueFileName);

        await fs.writeFile(filePath, buffer); // Save the file to the uploads folder


        const savedData = await db.insert(notes).values({
            fileName: file.name,
            filePath: uniqueFileName,
            fileType: file.type,
            topic: topicId ? topicId : null,
            subjectRef: subjectId ? subjectId : null,
            courseRef: courseId ? courseId : null,
            fileSize: file.size,
            userId: token.id
        })
        revalidatePath("/subjects")
        return NextResponse.json({
            message: 'File uploaded successfully',
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json(ApiResponse.error(500, `File upload failed: ${error.message}`), { status: 500 });
    }
}
