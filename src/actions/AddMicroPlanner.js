"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { db } from "@/db/drizzle"
import { microPlanner, users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function AddMicroPlanner(name, start, end) {
    const token = await getServerSession(authOptions)
    if (!token) {
        return { error: "Unauthorized request" }
    }

    try {
        if (!name) {
            return { error: "Plan name is required " }
        }

        await db
            .insert(microPlanner)
            .values(
                {
                    owner: token.id,
                    name: name,
                    start: start,
                    end: end
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
