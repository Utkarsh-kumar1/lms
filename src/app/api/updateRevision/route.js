import { getToken } from 'next-auth/jwt';
import dbconnect from "@/lib/dbconnect"
import ApiResponse from '@/helpers/ApiResponse';

export async function PATCH(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    const { status, subtopicId, revisionId } = await req.json();
    

    const end = status ? "CURRENT_TIMESTAMP()" : null;
    console.log(status);
    

    try {
        const pool = dbconnect();
        const [data] = await pool.execute(
            "SELECT id FROM revision WHERE subtopic = ? AND owner = ?",
            [subtopicId, token.id]
        );
        if (data.length === 0) {
            return Response.json(ApiResponse.error(403, "Forbidden"), { status: 403 });
        }
        console.log(data);
        
        // Use a conditional expression to handle the end value
        const updatedResponse = await pool.execute(
            "UPDATE revision SET end = IF(? IS NOT NULL, CURRENT_TIMESTAMP(), null) WHERE id = ? ;",
            [status, revisionId]
        );
    } catch (error) {
        return Response.json(ApiResponse.error(500, "Error while updating Activity "), { status: 500 })

    }

    return Response.json({ status: 200 });
}
