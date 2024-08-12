
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


        const [courses] = await pool.execute(
            "SELECT c.id , c.courseName , s.id AS subjectId  FROM `course` c JOIN `subject` s ON c.subject = s.id WHERE s.owner = ?;",
            [token.id]
        );

        return Response.json(ApiResponse.success(200, courses, "Course Data fetched successfully"), { status: 200 })
    } catch (error) {
        console.log(error);

        return Response.json(ApiResponse.error(500, "Error while Fetching the Subjects"), { status: 500 })
    }

}
