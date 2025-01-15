"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { db } from "@/db/drizzle"
import { microPlanner } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function DeleteMicroPlanner(id) {
    const token = await getServerSession(authOptions)
    if (!token) {
        return { error: "Unauthorized request" }
    }
    else if (!id) {
        return { error: "id is required " }

    }

    try {
        await db
        .delete(microPlanner)
        .where(eq(microPlanner.id, id));
        revalidatePath("/dashboard");
        return { success: true };
    }
    catch (error) {
        console.error("Error deleting microPlanner", error)
    }

}