import { getToken } from 'next-auth/jwt';
import dbconnect from "@/lib/dbconnect"
import ApiResponse from '@/helpers/ApiResponse';

export async function PATCH(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    const { status, id } = await req.json();

    if (!token) {
        return Response.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    }
    

    try {
        const pool = dbconnect();

        const response = await pool.execute(
            `UPDATE dailyActivitiesScheduled SET isCompleted = ? WHERE id = ? AND owner = ?;`,
            [status , id, token.id]
        );
        

        return Response.json({ status: 200, message: "Update successful" });

    } catch (error) {


        return Response.json(ApiResponse.error(500, "Error while updating Activity "), { status: 500 })

    }

}



