"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/db/drizzle";
import { activity } from "@/db/schema";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache"


export async function CreateActivity(subtopicId, courseSession) {

  const token = await getServerSession(authOptions);
  if (!token) {
    return { error: "Unauthorized request" };
  }

  try {
    const newActivityData = {
      owner: token.id,
      subTopic: subtopicId,
      session: courseSession,
    };

    // Insert new activity
      await db.insert(activity).values(newActivityData);

  } catch (error) {
    // Return a plain object with a serializable error message
    return {
      error: error.message || "Something Went Wrong",
    };
    }
    
    revalidatePath("/activity")
    return { success: true }
}
