"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { db } from "@/db/drizzle"
import { course } from "@/db/schema"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function AddCourse(subjectId, courseNames) {
    const token = await getServerSession(authOptions)

    try {
        if (!subjectId) {
            return { error: "Subject Id is required " }
        }
        else if (courseNames.length <= 0) {
            return { error: "CourseNames is required " }
        }
        console.log(subjectId, courseNames);

        const insertValues = courseNames.map((courseName) => ({ courseName, subject: subjectId }))

        await db.insert(course).values(insertValues)


    } catch (error) {
        // Return a plain object with a serializable error message
        return {
            error: error.message || "SomethingWent Wrong"
        }
    }

    // Ensure you return something that is serializable after revalidating
    revalidatePath("/courses")
    return { success: true }
}
