"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { db } from "@/db/drizzle"
import {  topics } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function DeleteTopic(topicId) {

    const token = await getServerSession(authOptions)
    if (!token) {
        return { error: "Unauthorized request" }
    }

    try {
        const user = await db.query.users.findFirst({
            with: {
                subjects: {
                    with: {
                        courses: {
                            with: {
                                topics: {
                                    where: (topic, { eq }) => eq(topic.id, topicId),
                                },
                            },
                        },
                    },
                },
            },
            where: (user, { eq }) => eq(user.id, token.id),
        });

        if (user && user.subjects.length > 0) {

            let isOwner = false;

            // Loop through the subjects to check courses and topics
            for (const subject of user.subjects) {
                if (subject.courses && subject.courses.length > 0) {
                    for (const course of subject.courses) {
                        if (course.topics && course.topics.length > 0) {
                            isOwner = true;  // Found a matching topic, user is the owner
                            break;
                        }
                    }
                }
                if (isOwner) break;  // Exit early if the owner is confirmed
            }

            if (isOwner) {
                await db.delete(topics).where(eq(topics.id, topicId));
                revalidatePath("/topics");
                return { success: true };
            } else {
                return { error: "Unauthorized Access" };
            }
        }
        else {
            return { error: "No Data found" };
        }

    } catch (error) {
        return { error: "Error while Deleting" }
    }

}