"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { db } from "@/db/drizzle"
import { dailyActivitiesScheduled, users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function DeleteActivity(activityName, id) {
    const token = await getServerSession(authOptions)
    if (!token) {
        return { error: "Unauthorized request" }
    }
    else if (!id || !activityName) {
        return { error: "activityName , id is required " }

    }

    try {

        const user = await db.query.users.findFirst({
            columns: {
                tasks: true,
                id: true
            },
            with: {
                dailyActivitiesScheduleds: {
                    where: (dailyActivitiesScheduled, { eq }) => eq(dailyActivitiesScheduled.id, id)
                }
            },
            where: (user, { eq }) => eq(user.id, token.id)
        })

        const tasks = user.tasks

        if (tasks.includes(activityName.trim()) || user.dailyActivitiesScheduleds.length > 0) {

            await db.transaction(async (tx) => {
                if (tasks.includes(activityName.trim())) {
                    const newTasks = tasks.filter((task) => task != activityName.trim())

                    await tx
                        .update(users)
                        .set({ tasks: newTasks })
                        .where(
                            eq(users.id, user.id

                            )
                        )
                }
                if (user.dailyActivitiesScheduleds.length > 0) {
                    await tx
                        .delete(dailyActivitiesScheduled)
                        .where(eq(dailyActivitiesScheduled.id, id))
                }
            })


            revalidatePath("/dashboard")
            return { success: true }
        }
        else {

            return { success: true }
        }


    } catch (error) {
        // Return a plain object with a serializable error message
        return {
            error: error.message || "Something Went Wrong"
        }
    }


}
