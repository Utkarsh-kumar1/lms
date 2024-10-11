import { getToken } from 'next-auth/jwt';
import dbconnect from "@/lib/dbconnect";
import ApiResponse from '@/helpers/ApiResponse';

export async function GET(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    if (!token) {
        return Response.json(ApiResponse.error(400, "Unauthorized access"), { status: 401 });
    }

    try {
        const pool = dbconnect();

        // Combined query for both activity and revision tables
        const combinedQuery = `
        (
            SELECT 'activity' AS id, DAYNAME(end) AS x, COUNT(*) AS y
            FROM activity
            WHERE end BETWEEN NOW() - INTERVAL 7 DAY AND NOW()
            GROUP BY x
        )
        UNION ALL
        (
            SELECT 'revision' AS id, DAYNAME(end) AS x, COUNT(*) AS y
            FROM revision
            WHERE end BETWEEN NOW() - INTERVAL 7 DAY AND NOW()
            GROUP BY x
        )
        ORDER BY FIELD(x, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
        `;

        const [rows] = await pool.execute(combinedQuery);

        // Array of all weekdays
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        // Initialize data structures for activity and revision with zero counts
        const activityData = weekdays.map(day => ({ x: day, y: 0 }));
        const revisionData = weekdays.map(day => ({ x: day, y: 0 }));

        // Fill in the data from the query results
        rows.forEach(row => {
            if (row.id === 'activity') {
                const dayIndex = weekdays.indexOf(row.x);
                if (dayIndex !== -1) {
                    activityData[dayIndex].y = row.y;
                }
            } else if (row.id === 'revision') {
                const dayIndex = weekdays.indexOf(row.x);
                if (dayIndex !== -1) {
                    revisionData[dayIndex].y = row.y;
                }
            }
        });

        // Format the final response for Nivo
        const response = [
            {
                id: 'activity',
                color: 'hsl(81, 70%, 50%)',
                data: activityData
            },
            {
                id: 'revision',
                color: 'hsl(70, 70%, 50%)',
                data: revisionData
            }
        ];
        console.log("Final Response for Chart:", JSON.stringify(response, null, 2));


        // Send the formatted response
        return Response.json(ApiResponse.success(200, response, "Data fetched successfully"), { status: 200 });

    } catch (error) {
        console.error(error);
        return Response.json(ApiResponse.error(500, "Error while fetching the data"), { status: 500 });
    }
}
