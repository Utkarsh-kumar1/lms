"use server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/db/drizzle";
import { recurringTasks, tasks, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
const { v4: uuidv4 } = require("uuid");

export async function AddOrUpdateTasks(task, id = null) {
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

  // Insert a new Task into the database
  try {
    if (!title || !startDate || !duration || !recurrencePattern) {
      if (title) {
        await db.insert(tasks).values({
          owner: token.id,
        title: title,
        startTime: null,
        duration: null,
        description: null,
        dueDate: null,
        priority: "low",
        });

        return { success: true };
      } else {
        return {
          error: "Title, Start Date and Recurrence Pattern are required ",
        };
      }
    }

    if (isRecurring) {

      // const recurrenceOptions = ["Daily", "Weekly", "Monthly", "Yearly", "Custom"];
      // set other values to null according to the recurrence pattern
      if (recurrencePattern === "Daily") {
        recurrenceDays = null;
        recurrenceMonthDays = null;
        recurrenceYearDays = null;
      } else if (recurrencePattern === "Weekly") {
        recurrenceInterval = null;
        recurrenceMonthDays = null;
        recurrenceYearDays = null;
      } else if (recurrencePattern === "Monthly") {
        recurrenceInterval = null;
        recurrenceDays = null;
        recurrenceYearDays = null;
      } else if (recurrencePattern === "Yearly") {
        recurrenceInterval = null;
        recurrenceDays = null;
        recurrenceMonthDays = null;
      } else if (recurrencePattern === "Custom") {
        recurrenceInterval = null;
        recurrenceDays = null;
        recurrenceMonthDays = null;
        recurrenceYearDays = null;
      }

      const uuid = uuidv4();
      
      await db.insert(recurringTasks).values({
        id: uuid,
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

      await db.execute(sql`CALL GenerateIfTodayRecurring(${uuid})`);

    } else {
      await db.insert(tasks).values({
        owner: token.id,
        title: title,
        startTime: startTime,
        duration: duration,
        description: description,
        dueDate: startDate,
        priority: priority,
      });
    }

    return { success: true };
  } catch (error) {
    return {
      error: error.message || "Something Went Wrong",
    };
  }
}
