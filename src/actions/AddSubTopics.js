"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { db } from "@/db/drizzle"
import { subtopics } from "@/db/schema"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function AddSubTopics(subtopicNames, subjectId, courseId, topicId) {
    const token = await getServerSession(authOptions)
    if (!token) {
        return { error: "Unauthorized request" }
    }

    try {
        if (!subjectId) {
            return { error: "Subject Id is required " }
        }
        if (!courseId) {
            return { error: "Subject Id is required " }
        }
        if (!topicId) {
            return { error: "topic Id is required " }
        }
        else if (subtopicNames.length <= 0) {
            return { error: "CourseNames is required " }
        }
        console.log(subjectId, subtopicNames, courseId, topicId);

        const subject = await db.query.subject.findFirst({
            with: {
                courses: {
                    with: {
                        topics: {
                            with: {
                                subtopics: {
                                    orderBy: (subtopic, { desc }) => [desc(subtopic.subTopicIndex)],
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

        if (subject?.courses[0]?.topics.length <= 0) {
            return { error: "No Data found" }
        }



        let nextTopicIndex = (subject?.courses[0]?.topics[0]?.subtopics[0]?.subTopicIndex || 0) + 1;
        console.log(nextTopicIndex);

        const insertValues = subtopicNames
            .map(
                (subtopicName) => (
                    {
                        subtopicName,
                        topic: topicId,
                        subTopicIndex: nextTopicIndex++
                    }
                ))

        await db.insert(subtopics).values(insertValues)

        revalidatePath("/subTopics")
        return { success: true }


    } catch (error) {
        if (error.code == "ER_DUP_ENTRY") {
            return {
                error: "Subject Already exists"
            }
        }
        // Return a plain object with a serializable error message
        console.log(error);
        
        return {
            error: error.message || "SomethingWent Wrong"
        }
    }


}
