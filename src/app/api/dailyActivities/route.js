
import { getToken } from 'next-auth/jwt';
import ApiResponse from '@/helpers/ApiResponse';
import { db } from "@/db/drizzle";
import { dailyActivitiesScheduled } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(req) {

    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    if (!token) {
        return Response.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    }
    const searchParams = req.nextUrl.searchParams
    const date = searchParams.get('date')


    try {
        const dailyActivities = await db.query.users.findFirst({

            with: {
                dailyActivitiesScheduledsView: {
                    where: (dailyActivitiesScheduled, { eq, sql }) => eq(
                        sql`Date(${dailyActivitiesScheduled.startDate})`,
                        date ? sql`Date(${date})` : sql`CURRENT_DATE()`
                    ),
                }
            },

            where: (user, { eq }) => eq(user.id, token.id)
        })

        return Response.json(ApiResponse.success(200, dailyActivities.dailyActivitiesScheduledsView, "Data fetched successfully"), { status: 200 });
    } catch (error) {

        return Response.json(ApiResponse.error(500, "Error while fetching the data"), { status: 200 });
    }
}


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
            .update(dailyActivitiesScheduled)
            .set({ isCompleted: status ? true : false })
            .where(
                and(
                    eq(dailyActivitiesScheduled.id, id),
                    eq(dailyActivitiesScheduled.owner, token.id)
                )
            )

        return Response.json({ status: 200, message: "Update successful" });

    } catch (error) {


        return Response.json(ApiResponse.error(500, "Error while updating Activity "), { status: 500 })

    }

}




