import { getToken } from 'next-auth/jwt';
import ApiResponse from '@/helpers/ApiResponse';
import { db } from '@/db/drizzle';
import { subject } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function PATCH(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });

    if (!token) {
        return Response.json(ApiResponse.error(400, "Unauthorized access"), { status: 401 });
    }
    const { newSubjectName, id } = await req.json();
    if (!newSubjectName) {
        return Response.json(ApiResponse.error(400, "Subject Name is required"), { status: 400 });
    }

    try {

        const subjectData = await db.query.subject.findFirst({
            where: (subject, { eq, and }) => and(
                eq(subject.owner, token.id),
                eq(subject.id, id)
            )
        })
        if (subjectData.length <= 0) {
            return Response.json(ApiResponse.error(403, "Forbidden"), { status: 403 });
        }

        if (subjectData.subjectName == newSubjectName) {
            return Response.json(ApiResponse.success("200", null, "Updated Successfully"), { status: 200 })
        }


        await db
            .update(subject)
            .set({
                subjectName: newSubjectName
            })
            .where(
                and(
                    eq(subject.id, id),
                    eq(subject.owner, token.id)
                )
            )

        return Response.json({ status: 200, message: "Update successful" });

    } catch (error) {


        return Response.json(ApiResponse.error(500, "Error while updating Activity "), { status: 500 })

    }

}



