"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { db } from "@/db/drizzle"
import { getServerSession } from "next-auth"

export async function GetRecuringAndSceduledList() {
    const token = await getServerSession(authOptions)
    if (!token) {
        return { error: "Unauthorized request" }
    }

    try {

        const recurringTasks = await db.query.recurringTasks.findMany({
            where: (task, { eq, gte, and, or , sql  , isNull }) =>and(
                eq(task.owner, token.id),
                or(
                    isNull(task.endDate),
                    gte(task.endDate, new Date())

                )
            )
                    
        });


        console.log(recurringTasks);

        return { success: true, data: recurringTasks }


    } catch (error) {
        // Return a plain object with a serializable error message
        return {
            error: error.message || "Something Went Wrong"
        }
    }

    // Ensure you return something that is serializable after revalidating

}
