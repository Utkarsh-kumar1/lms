"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { db } from "@/db/drizzle"
import {  subtopics } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function DeleteSubTopic(subtopicId) {

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
                                    with: {
                                        subtopics: {

                                            where: (subtopic, { eq }) => eq(subtopic.id, subtopicId),
                                        }
                                    }
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
                        for (const topic of course.topics) {
                            if (topic.subtopics && topic.subtopics.length > 0) {
                                isOwner = true;  // Found a matching topic, user is the owner
                                break;
                            }
                        }
                        if (isOwner) {
                            break;
                        }

                    }
                }
                if (isOwner) break;  // Exit early if the owner is confirmed
            }

            if (isOwner) {
                await db.delete(subtopics).where(eq(subtopics.id, subtopicId));
                revalidatePath("/subTopics");
                return { success: true };
            } else {
                return { error: "Unauthorized Access" };
            }
        }
        else {
            return { error: "No Data found" };
        }

    } catch (error) {
        console.log();
        
        return { error: "Error while Deleting" }
    }

}