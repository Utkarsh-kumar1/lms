import { getToken } from "next-auth/jwt";
import ApiResponse from "@/helpers/ApiResponse";
import { db } from "@/db/drizzle";
import { tasks } from "@/db/schema";
import { and, eq, isNotNull, isNull, lte, ne } from "drizzle-orm";

export async function GET(req) {
  const secret = process.env.JWT_SECRET;
  const token = await getToken({ req, secret });
  const today = req.nextUrl.searchParams.get("today");
  console.log("today", today);
  if (!token) {
    return Response.json(ApiResponse.error(401, "Unauthorized access"), {
      status: 401,
    });
  }

  try {

    if (today === "todo") {
      const data = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.owner, token.id), isNull(tasks.duration)))
        .orderBy(tasks.createdAt);
        
      return Response.json(
        ApiResponse.success(200, data, "Data fetched successfully"),
        { status: 200 }
      );
    }
    else {

      const data = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.owner, token.id), eq(tasks.dueDate, today), isNotNull(tasks.duration)))
        .orderBy(tasks.startTime);

      return Response.json(
        ApiResponse.success(200, data, "Data fetched successfully"),
        { status: 200 }
      );
    }


  } catch (error) {
    console.error(error);

    return Response.json(
      ApiResponse.error(500, "Error while fetching the data"),
      { status: 200 }
    );
  }
}

export async function PATCH(req) {
  const secret = process.env.JWT_SECRET;
  const token = await getToken({ req, secret });
  const { status, id } = await req.json();
  console.log(status);


  if (!token) {
    return Response.json(ApiResponse.error(401, "Unauthorized access"), {
      status: 401,
    });
  }

  if (status == null) {
    return Response.json(ApiResponse.error(400, "status is required"), {
      status: 400,
    });
  }

  try {
    const updateResponse = await db
      .update(tasks)
      .set({ status: status })
      .where(and(eq(tasks.id, id), eq(tasks.owner, token.id)));

    const updatedTask = await db.query.tasks.findFirst({
      where: (task, { eq, and }) => and(eq(task.id, id), eq(tasks.owner, token.id))
    })

    return Response.json(
      ApiResponse.success(200, updatedTask, "Updated Successfully")
    );
  } catch (error) {
    console.log(error);
    return Response.json(
      ApiResponse.error(500, "Error while updating Building Block "),
      { status: 500 }
    );
  }
}


export async function DELETE(req) {
  const secret = process.env.JWT_SECRET;
  const token = await getToken({ req, secret });
  const { id } = await req.json();

  console.log("id in delete from route.js", id);

  if (!token) {
    return Response.json(ApiResponse.error(401, "Unauthorized access"), {
      status: 401,
    });
  }

  if (!id) {
    return Response.json(ApiResponse.error(400, "id is required"), {
      status: 400,
    });
  }

  try {
    const deleteResponse = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.owner, token.id)));

    return Response.json({ status: 200, message: "Delete successful" });
  } catch (error) {
    console.log(error);
    return Response.json(
      ApiResponse.error(500, "Error while deleting Building Block "),
      { status: 500 }
    );
  }
}