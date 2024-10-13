import { getToken } from 'next-auth/jwt';
import ApiResponse from '@/helpers/ApiResponse';
import { db } from '@/db/drizzle';
import { topics } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function PATCH(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    const { newtopicName: topicName, id, isCompleted, subjectId, courseId } = await req.json();


    if (!token) {
        return Response.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    }

    if (!id && !subjectId && !courseId && (!isCompleted && !topicName)) {
        return Response.json(ApiResponse.error(400, "newCourseName , courseId , subjectId , id  is requried"), { status: 401 });

    }
    try {

        const subjectData = await db.query.subject.findFirst({
            with: {
                courses: {
                    with: {
                        topics: {
                            where: (topic, { eq }) => eq(topic.id, id)
                        }
                    },
                    where: (course, { eq }) => eq(course.id, courseId)
                }
            },
            where: (subject, { eq, and }) => and(
                eq(subject.id, subjectId),
                eq(subject.owner, token.id)
            )
        })

        if (!subjectData && subjectData.courses.length <= 0 && subjectData.courses[0].topics.length <= 0) {
            return Response.json(ApiResponse.error(403, "Forbidden"), { status: 403 });
        }

        const topic = subjectData.courses[0].topics[0]


        if (topic.topicName === topicName && topic.isCompleted === isCompleted) {
            return Response.json(ApiResponse.success("200", null, "Updated Successfully"), { status: 200 })
        }

        await db
            .update(topics)
            .set({
                topicName,
                isCompleted: isCompleted ?? topic.isCompleted
            })
            .where(and(eq(topics.id, id), eq(topic.course, courseId)))

        return Response.json({ status: 200, message: "Update successful" }, { status: 200 });

    } catch (error) {


        return Response.json(ApiResponse.error(500, "Error while updating Activity "), { status: 500 })

    }

}


