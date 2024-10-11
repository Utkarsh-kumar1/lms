"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { db } from "@/db/drizzle"
import { course } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function DeleteCourse(courseId) {

    const token = await getServerSession(authOptions)

    try {
        const user = await db.query.users.findFirst({
            with: {
                subjects: {
                    with: {
                        courses: true
                    },
                }
            },
            where: (user, { eq, and }) => eq(user.id, token.id)
        })



        if (user || user.subjects.length > 0) {

            let isOwner = false
            for (const subject of user.subjects) {
                if (subject.courses && subject.courses.length > 0) {
                    isOwner = true;
                    break;
                }
            }


            if (isOwner) {

                await db.delete(course).where(eq(course.id, courseId))
                revalidatePath("/courses")
                return { success: true }
            }
            else {
                return { error: "Unauthorized Access" }
            }

        } else {
            return { error: "Data Not found" };

        }

    } catch (error) {
        return { error: "Error while Deleting" }
    }

}