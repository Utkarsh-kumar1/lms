
import { getToken } from 'next-auth/jwt';
import ApiResponse from '@/helpers/ApiResponse';
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { notes } from '@/db/schema';


export async function GET(req) {

    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    if (!token) {
        return Response.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    }
    const searchParams = req.nextUrl.searchParams
    const topic = searchParams.get('topic')


    try {
        const data = await db.select({
            notesFilename: notes.fileName,
            notesFilePath: notes.filePath,
            notesCreatedAt: notes.createdAt,
        })
            .from(notes)
            .where(eq(notes.topic, topic));

        return Response.json(ApiResponse.success(200, data, "Notes fetched successfully"), { status: 200 });
    } catch (error) {

        return Response.json(ApiResponse.error(500, "Error while fetching the notes"), { status: 200 });
    }
}
