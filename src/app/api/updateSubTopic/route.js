import { getToken } from 'next-auth/jwt';
import ApiResponse from '@/helpers/ApiResponse';
import { db } from '@/db/drizzle';
import { subtopics } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function PATCH(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    const { newsubtopicName: subtopicName, id, isCompleted, subjectId, courseId, topicId } = await req.json();

    if (!id || !subjectId || !courseId || (isCompleted === undefined && !subtopicName)) {
        return Response.json(ApiResponse.error(400, "id, subjectId, courseId, and either isCompleted or subtopicName are required"), { status: 400 });
    }


    try {

        const subject = await db.query.subject.findMany({
            with: {
                courses: {
                    with: {
                        topics: {
                            with: {
                                subtopics: {
                                    where: (subtopic, { eq }) => eq(subtopic.id, id)
                                }
                            },
                            where: (topic, { eq }) => eq(topic.id, topicId)
                        }
                    },
                    where: (course, { eq }) => eq(course.id, courseId)
                }
            },
            where: (subject, { eq, and }) => and(
                eq(subject.owner, token.id),
                eq(subject.id, subjectId)
            )
        })

        if (subject.length <= 0 || subject[0].courses.length <= 0 || subject[0].courses[0].topics.length <= 0 || subject[0].courses[0].topics[0].subtopics.length <= 0) {
            return Response.json(ApiResponse.error(403, "Forbidden"), { status: 403 });
        }

        const subtopic = subject[0].courses[0].topics[0].subtopics[0]



        if (subtopic.subtopicName === subtopicName && subtopic.isCompleted === isCompleted) {
            return Response.json(ApiResponse.success(200, null, "Updated Successfully"), { status: 200 })
        }



        await db
            .update(subtopics)
            .set({
                isCompleted: isCompleted ?? subtopic.isCompleted,
                subtopicName: subtopicName ?? subtopic.subtopicName
            })
            .where(
                and(
                    eq(subtopics.id, id),
                    eq(subtopics.topic, topicId)
                )
            )

        return Response.json({ status: 200, message: "Update successful" }, { status: 200 });

    } catch (error) {


        return Response.json(ApiResponse.error(500, "Error while updating Subtopic "), { status: 500 })

    }

}


