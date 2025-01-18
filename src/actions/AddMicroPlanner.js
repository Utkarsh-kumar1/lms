"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { db } from "@/db/drizzle"
import { microPlanner, users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function AddOrUpdateMicroPlanner(name, start, end, id=null) {
    const token = await getServerSession(authOptions)
    if (!token) {
        return { error: "Unauthorized request" }
    }
    if (id) {
        if (!name) {
            return { error: "Plan name is required " }
        }
        await db
            .update(microPlanner)
            .set({
                name: name,
                start: start,
                end: end
            })
            .where(eq(microPlanner.id, id), eq(microPlanner.owner, token.id))

        revalidatePath("/dashboard")
        return { success: true }
    }

    else {

        // Insert a new Task into the database
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
    }

    // Ensure you return something that is serializable after revalidating

}
