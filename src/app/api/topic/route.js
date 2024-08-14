
import { getToken } from 'next-auth/jwt';
import dbconnect from "@/lib/dbconnect"
import ApiResponse from '@/helpers/ApiResponse';



export async function GET(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    if (!token) {
        return Response.json(ApiResponse.error(400, "Unauthorized access"), { status: 401 });
    }

    try {
        const pool = dbconnect()


        const [topics] = await pool.execute(
            "SELECT t.id , t.topicName , s.id AS subjectId , c.id AS courseId FROM topics t JOIN course c ON t.course = c.id JOIN subject s ON c.subject = s.id WHERE s.owner = ?",
            [token.id]
        );



        return Response.json(ApiResponse.success(200, topics, "Topic Data fetched successfully"), { status: 200 })
    } catch (error) {

        return Response.json(ApiResponse.error(500, "Error while Fetching the Subjects"), { status: 500 })
    }


}
