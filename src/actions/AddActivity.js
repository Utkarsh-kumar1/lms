"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { db } from "@/db/drizzle"
import { dailyActivitiesScheduled, users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function AddActivity(activityName) {
    const token = await getServerSession(authOptions)
    if (!token) {
        return { error: "Unauthorized request" }
    }

    try {
        if (!activityName) {
            return { error: "activityName Id is required " }
        }
        console.log(activityName);

        const user = await db.query.users.findFirst({
            columns: {
                tasks: true,
                id: true
            },
            where: (user, { eq }) => eq(user.id, token.id)
        })

        const tasks = user.tasks

        if (tasks.includes(activityName.trim())) {
            return { error: "This is Already Present" }
        }

        tasks.push(activityName.trim())


        const updateUser = await db
            .update(users)
            .set({ tasks })
            .where(
                eq(users.id, user.id

                )
            )


        const scheduleForToday = await db
            .insert(dailyActivitiesScheduled)
            .values(
                {
                    owner: user.id,
                    task: activityName.trim()
                })

        revalidatePath("/dashboard")
        return { success: true }


    } catch (error) {
        // Return a plain object with a serializable error message
        return {
            error: error.message || "Something Went Wrong"
        }
    }

    // Ensure you return something that is serializable after revalidating

}
