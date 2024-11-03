"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { db } from "@/db/drizzle"
import { topics } from "@/db/schema"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function AddTopics(topicNames, subjectId, courseId) {
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
        else if (topicNames.length <= 0) {
            return { error: "CourseNames is required " }
        }
        
        // TODO: need update regarding the token.id we should check for the topic belong to the user
        const maxIndexResult = await db.query.topics.findFirst({
            orderBy: (topic, { desc }) => [desc(topic.topicIndex)],
            where: (topic, { eq }) => eq(topic.course, courseId),
        });
        

        let nextTopicIndex = (maxIndexResult ? maxIndexResult?.topicIndex : 0) + 1;


        const insertValues = topicNames
            .map(
                (topicName) => (
                    {
                        topicName,
                        course: courseId,
                        topicIndex: nextTopicIndex++
                    }
                ))

        await db.insert(topics).values(insertValues)

        revalidatePath("/topics")
        return { success: true }


    } catch (error) {
        if (error.code == "ER_DUP_ENTRY") {
            return {
                error: "Subject Already exists"
            }
        }
        // Return a plain object with a serializable error message
        return {
            error: error.message || "SomethingWent Wrong"
        }
    }


}
