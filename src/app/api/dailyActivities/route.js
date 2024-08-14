import { NextResponse } from 'next/server';
import dbconnect from "../../../lib/dbconnect" // Adjust import based on your MySQL setup
import { getToken } from 'next-auth/jwt';
import ApiResponse from '@/helpers/ApiResponse';

export async function GET(req) {

    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    if (!token) {
        return Response.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    }
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('date')

    const date = query || new Date().toISOString().split('T')[0]; // Default to today if no date is provided

    try {
        // Query for today's data
        const pool = dbconnect()
        const [todayData] = await pool.query(
            `SELECT * FROM dailyActivitiesScheduled where startDate = Date(?) and owner = ? ORDER BY startDate DESC`,
            [date, token.id]
        );


        return Response.json(ApiResponse.success(200, todayData, "Data fetched successfully"), { status: 200 });
    } catch (error) {

        return Response.json(ApiResponse.error(500, "Error while fetching the data"), { status: 200 });
    }
}


export async function PATCH(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });

    if (!token) {
        return Response.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    }

    const { activityName } = await req.json();

    if (!activityName) {
        return Response.json(ApiResponse.error(400, "Activity Name required"), { status: 400 });
    }

    try {
        const pool = dbconnect();

        // Fetch existing tasks
        const [data] = await pool.execute("SELECT tasks FROM users WHERE id = ? ;", [token.id]);
        if (data.length === 0) {
            return Response.json(ApiResponse.error(404, "User not found"), { status: 404 });
        }

        const tasksString = data[0].tasks;
        let tasksArray = [];

        if (tasksString) {
            tasksArray = JSON.parse(tasksString);
        }

        if (tasksArray.includes(activityName)) {
            return Response.json(ApiResponse.error(400, "Activity already exists"), { status: 400 });
        }

        // Add new activity to tasks
        tasksArray.push(activityName);
        const newTasksString = JSON.stringify(tasksArray);

        // Update the user's tasks
        const [updateResponse] = await pool.execute("UPDATE users SET tasks = ? WHERE id = ?", [newTasksString, token.id]);

        if (updateResponse.affectedRows === 0) {
            return Response.json(ApiResponse.error(500, "Failed to update tasks"), { status: 500 });
        }

        // Schedule the new activity for today
        const [scheduleResponse] = await pool.execute(
            "INSERT INTO dailyActivitiesScheduled (owner, task) VALUES (?, ?)",
            [token.id, activityName]
        );

        if (scheduleResponse.affectedRows === 0) {
            return Response.json(ApiResponse.error(500, "Failed to schedule the activity"), { status: 500 });
        }

        return Response.json(ApiResponse.success(200, {
            id: scheduleResponse.insertId,
            owner: token.id,
            startDate: new Date().toISOString().split("T")[0],
            task: activityName,
            isCompleted: 0
        }, "Created and scheduled successfully"), { status: 200 });

    } catch (error) {
        console.error(error);
        return Response.json(ApiResponse.error(500, "Error while creating the activity"), { status: 500 });
    }
}
