"use server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/db/drizzle";
import { recurringTasks, tasks, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function AddOrUpdateTasks(task, id = null) {
  console.log("Logging tasks from server actions");
  const token = await getServerSession(authOptions);
  if (!token) {
    return { error: "Unauthorized request" };
  }

  const {
    title,
    startTime,
    duration,
    description,
    isRecurring,
    startDate,
    endDate,
    recurrencePattern,
    recurrenceInterval,
    recurrenceDays,
    recurrenceMonthDays,
    recurrenceYearDays,
    priority,
    customCron,
    customCronDescription,
    } = task;
  // console.log("Logging tasks from server actions", title);
  // if (id) {
  // if (!name) {
  //     return { error: "Plan name is required " }
  // }
  // await db
  //     .update(microPlanner)
  //     .set({
  //         name: name,
  //         start: start,
  //         end: end
  //     })
  //     .where(eq(microPlanner.id, id), eq(microPlanner.owner, token.id))
  // revalidatePath("/dashboard")
  // return { success: true }
  // } else {
  // Insert a new Task into the database
  try {
    if (!title || !startDate || !recurrencePattern) {
      return {
        error: "Title, Start Date and Recurrence Pattern are required ",
      };
    }
    console.log(
      "recurrence",
      recurrenceMonthDays.toString(),
      typeof recurrenceMonthDays
    );

      if (isRecurring) {
          await db.insert(recurringTasks).values({
              owner: token.id,
              title: title,
              startTime: startTime,
              duration: duration,
              description: description,
              isRecurring: isRecurring,
              startDate: startDate,
              endDate: endDate || null,
              recurrencePattern: recurrencePattern,
              recurrenceInterval: recurrenceInterval,
              recurrenceDays: recurrenceDays.toString() || null,
              recurrenceMonthDays: recurrenceMonthDays.toString() || null,
              recurrenceYearDays: recurrenceYearDays.toString() || null,
              priority: priority,
              customCron: customCron || null,
          });
      } else {
          await db.insert(tasks).values({
                owner: token.id,
                title: title,
                startTime: startTime,
                duration: duration,
              description: description,
            dueDate: new Date(),
            priority: priority,
          })
      }
    // console.log("Logging results from server actions", res);

    //   revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    // Return a plain object with a serializable error message
    return {
      error: error.message || "Something Went Wrong",
    };
  }
  //   }

  // Ensure you return something that is serializable after revalidating
}
