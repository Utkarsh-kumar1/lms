import { getToken } from "next-auth/jwt";
import ApiResponse from "@/helpers/ApiResponse";
import { db } from "@/db/drizzle";
import { microPlanner } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";


export async function PATCH(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    const { status, id } = await req.json();

    if (!token) {
        return Response.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    }

    if (status == null) {
        return Response.json(ApiResponse.error(400, "status is required"), { status: 400 });
    }

    try {

        const updateResponse = await db
            .update(microPlanner)
            .set({ completed: status ? null : sql`CURRENT_TIMESTAMP` })
            .where(
                and(
                    eq(microPlanner.id, id),
                    eq(microPlanner.owner, token.id)
                )
        );
                
        return Response.json(ApiResponse.success(200, updateResponse, "Data updated successfully"), { status: 200 });
    } catch (error) {
        return Response.json(ApiResponse.error(500, "Error while updating the data in microPlanner"), { status: 500 });
    }
}