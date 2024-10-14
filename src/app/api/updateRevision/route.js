import { getToken } from 'next-auth/jwt';
import ApiResponse from '@/helpers/ApiResponse';
import { db } from '@/db/drizzle';
import { revision } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function PATCH(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    if (!token) {
        return NextResponse.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    }
    const { status, subtopicId, revisionId } = await req.json();

    if (status == null || !subtopicId || !revisionId) {
        return Response.json(ApiResponse.error(400, "status , subtopicId and revisionId  is Required"), { status: 400 })
    }


    try {

        const revisionData = await db.query.revision.findFirst({
            where: (revision, { eq, and }) => and(
                eq(revision.id, revisionId),
                eq(revision.subtopic, subtopicId),
                eq(revision.owner, token.id)
            )
        })
        if (!revisionData) {
            return Response.json(ApiResponse.error(403, "Forbidden"), { status: 403 });
        }

        if (revisionData.end && status == true) {
            return Response.json(ApiResponse.success(200, null, "Updated Successfully"), { status: 200 })

        }
        else if (!revisionData.end && status == false) {
            return Response.json(ApiResponse.success(200, null, "Updated Successfully"), { status: 200 })

        }

        const updateRevision = await db
            .update(revision)
            .set(
                {
                    end: status ? new Date() : null
                }
            )
            .where(
                and(
                    eq(revision.id, revisionData.id),
                    eq(revision.owner, token.id)
                )
            )
    } catch (error) {
        return Response.json(ApiResponse.error(500, "Error while updating Activity "), { status: 500 })

    }

    return Response.json(ApiResponse.success(200, null, "Updated Successfully"), { status: 200 })

}
