
import { db } from '@/db/drizzle';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

const getRecurringTasks = async (id) => {
    const recurringTasks = await db.query.recurringTasks.findMany({
        where: (recurringTasks, { eq }) => eq(recurringTasks.owner, id),
    });

    return recurringTasks;

}
const getTasks = async (id) => {
    const tasks = await db.query.tasks.findMany({
        where: (tasks, { eq }) => eq(tasks.owner, id),
    });
    return tasks;
}


export async function GET(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    if (!token) {
        return Response.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    }
    const tasks = await getTasks(token.id); // regular tasks
    const recurringTasks = await getRecurringTasks(token.id); // recurring tasks
    return NextResponse.json({ tasks, recurringTasks }, { status: 200 });
}
