import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import ApiResponse from "@/helpers/ApiResponse";
import { eq } from "drizzle-orm";
import { getToken } from "next-auth/jwt";

export async function POST(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });

    if (!token) {
        return Response.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    }

    //validate wether the req.spaceRepetation is valid array of not 
    const { spaceRepetation } = await req.json();


    if(!Array.isArray(spaceRepetation)){
        return Response.json(ApiResponse.error(400, "spaceRepetation should be an array"), { status: 400 });
    }

    try {
        //update the db
        await db.update(users).set({ spaceRepetition : spaceRepetation }).where(eq(users.id, token.id));
    } catch (error) {
        console.log(error);
        
        return Response.json(ApiResponse.error(500, "Internal server error"), { status: 500 });
        
    }

    return Response.json(ApiResponse.success(200, null, "Space Repetation updated successfully"), { status: 200 });


}