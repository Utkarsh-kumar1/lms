import { getToken } from 'next-auth/jwt';
import dbconnect from "@/lib/dbconnect"
import ApiResponse from '@/helpers/ApiResponse';

export async function PATCH(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    const { status, id } = await req.json();

    const end = status ? "CURRENT_TIMESTAMP()" : null;

    try {
        const pool = dbconnect();
        // Use a conditional expression to handle the end value
        const updateResponse = await pool.execute(
            "UPDATE activity SET end = IF(? IS NOT NULL, CURRENT_TIMESTAMP(), null) WHERE owner = ? AND subTopic = ?",
            [end, token.id, id]
        );
    } catch (error) {
        return  Response.json( ApiResponse.error(500 ,"Error while updating Activity ") , {status : 500})
        
    }

    return  Response.json({ status: 200 });
}
