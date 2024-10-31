"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { db } from "@/db/drizzle"
import { subject } from "@/db/schema"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function AddNewSubjectAction(subjectNames) {
    const token = await getServerSession(authOptions)
    if (!token) {
        return { error: "Unauthorized request" }
    }

    try {
        const subjects = subjectNames?.map((subjectName) => {
            return { owner: token.id, subjectName }
        })

        console.log(subjects)

        await db.insert(subject).values(subjects)
    } catch (error) {
        if (error.code == "ER_DUP_ENTRY")
        {
            return {
                error:  "Subject Already exists"
            } 
        }
        
        // Return a plain object with a serializable error message
        return {
            error: error.message || "SomethingWent Wrong"
        }
    }

    // Ensure you return something that is serializable after revalidating
    revalidatePath("/subjects")
    return { success: true }
}
