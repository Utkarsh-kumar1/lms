import { getToken } from 'next-auth/jwt';
import ApiResponse from '@/helpers/ApiResponse';
import { db } from '@/db/drizzle';
import { activity } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function PATCH(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    if (!token) {
        return Response.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    }

    const { status, subtopicId, activityId } = await req.json();

    console.log(status, subtopicId, activityId);

    if (status == null || !subtopicId || !activityId) {
        return Response.json(ApiResponse.error(400, "status , subtopicId and  activityId is required"), { status: 400 })
    }


    try {

        const activityData = await db.query.activity.findFirst({
            where: (activity, { eq, and }) => and(
                eq(activity.owner, token.id),
                eq(activity.id, activityId),
                eq(activity.subTopic, subtopicId)
            )
        })
        if (!activityData) {
            return Response.json(ApiResponse.error(403, "Forbidden"), { status: 403 });
        }
        // Use a conditional expression to handle the end value
        if (activityData.end && status == true) {
            return Response.json(ApiResponse.success(200, null, "Updated Successfully"), { status: 200 })

        }
        else if (!activityData.end && status == false) {
            return Response.json(ApiResponse.success(200, null, "Updated Successfully"), { status: 200 })

        }

        const updateResponse = await db
            .update(activity)
            .set(
                {
                    end: status ? new Date() : null
                }
            )
            .where(
                and(
                    eq(activity.id, activityId),
                    eq(activity.subTopic, subtopicId),
                    eq(activity.owner, token.id)
                )
            )

        return Response.json(ApiResponse.success(200, null, "Updated Successfully"), { status: 200 })

    } catch (error) {
        return Response.json(ApiResponse.error(500, "Error while updating Activity "), { status: 500 })

    }


}
