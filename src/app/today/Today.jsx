import { db } from "@/db/drizzle";
import React from "react";
import TaskList from "./TaskList";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";

async function Today() {
  const token = await getServerSession(authOptions)
  const tasks = await db.query.tasks.findMany({
    where: (task, { eq, and }) =>
      and(
        eq(task.owner, token.id),
        eq(task.dueDate, new Date().toISOString().split("T")[0])
      ),
    orderBy: (task, { asc }) => asc(task.startTime),
  });

  return (
    <div className="w-full h-full rounded-md p-4">
      {/* Header */}

      {/* Tasks Section */}
      <TaskList initialTasks={tasks} />
    </div>
  );
}

export default Today;
