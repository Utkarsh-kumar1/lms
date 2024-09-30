import { getToken } from 'next-auth/jwt';
import dbconnect from "@/lib/dbconnect";
import ApiResponse from '@/helpers/ApiResponse';

export async function GET(req, context) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });

    if (!token) {
        return new Response(JSON.stringify(ApiResponse.error(401, "Unauthorized access")), { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topicId");

    if (!topicId) {
        return new Response(JSON.stringify(ApiResponse.error(400, "topicId is required")), { status: 400 });
    }

    try {
        const pool = await dbconnect(); // Ensure dbconnect works as expected

        const [notes] = await pool.execute(
            "SELECT * FROM topic_notes WHERE userId = ? AND topicId = ?",
            [token.id, topicId]
        );

        return Response.json(ApiResponse.success(200, notes[0]?.notes , "Notes Data fetched successfully"), { status: 200 });
    } catch (error) {
        console.error("Database error: ", error);
        return new Response(JSON.stringify(ApiResponse.error(500, "Error while fetching the notes")), { status: 500 });
    }
}
