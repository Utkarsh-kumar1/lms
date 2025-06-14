import { db } from "@/db/drizzle";
import ApiResponse from "@/helpers/ApiResponse";
import { getToken } from "next-auth/jwt";


 export async function GET(req) {

    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });

    if (!token) {
        return Response.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    }

    const user = await db.query.users.findFirst({
        where: (user , {eq})=> eq(user.id, token.id),
    });

    if (!user) {
        return Response.json(ApiResponse.error(404, "User not found"), { status: 404 });
    }
    
    //remove password , token from the user and send all 
     const { userPassword , otp , otpExpiry , refreshToken , ...userWithoutPassword } = user;

    return Response.json(ApiResponse.success(200, userWithoutPassword, "User fetched successfully"), { status: 200 });

}