"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { db } from "@/db/drizzle"
import { subject } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function DeleteSubjectAction(subjectId) {
    const token = await getServerSession(authOptions)

    try {
        const usersubject = await db.query.users.findFirst({
            with: {
                subjects: {
                    where: (subject, { eq }) => eq(subject.id, subjectId)
                }
            },
            where: (user, { eq, and }) => eq(user.id, token.id)
        })

        if (!usersubject || usersubject.subjects.length <= 0) {

            return { error: "Data Not found" };

        } else {
            await db.delete(subject).where(eq(subject.id, usersubject.subjects[0].id))
            revalidatePath("/subjects")
            return { success: true }
        }

    } catch (error) {
        return { error: "Error while Deleting" }
    }

}