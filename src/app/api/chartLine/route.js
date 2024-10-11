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

        // Combined query for both activity and revision tables for the last 7 days
        const [rows] = await pool.execute(`
        (
            SELECT 'activity' AS id, DAYNAME(end) AS x, COUNT(*) AS y
            FROM activity
            WHERE owner = ? AND end BETWEEN NOW() - INTERVAL 6 DAY AND NOW() 
            GROUP BY x
        )
        UNION ALL
        (
            SELECT 'revision' AS id, DAYNAME(end) AS x, COUNT(*) AS y
            FROM revision
            WHERE owner = ? AND end BETWEEN NOW() - INTERVAL 6 DAY AND NOW()
            GROUP BY x
        )
        ORDER BY FIELD(x, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
        `, [token.id, token.id]);

        // Get today's day index
        const today = new Date().getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday

        // Array of abbreviated weekdays starting from the day after today
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const orderedWeekdays = weekdays.slice(today + 1).concat(weekdays.slice(0, today + 1));

        // Initialize data structures for activity and revision with zero counts
        const activityData = orderedWeekdays.map(day => ({ x: day, y: 0 }));
        const revisionData = orderedWeekdays.map(day => ({ x: day, y: 0 }));

        // Fill in the data from the query results
        rows.forEach(row => {
            const dayMap = {
                'Sunday': 'Sun',
                'Monday': 'Mon',
                'Tuesday': 'Tue',
                'Wednesday': 'Wed',
                'Thursday': 'Thu',
                'Friday': 'Fri',
                'Saturday': 'Sat'
            };

            const shortDay = dayMap[row.x];
            const dayIndex = orderedWeekdays.indexOf(shortDay);
            if (dayIndex !== -1) {
                if (row.id === 'activity') {
                    activityData[dayIndex].y = row.y;
                } else if (row.id === 'revision') {
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

        return Response.json(ApiResponse.success(200, response, "Data fetched successfully"), { status: 200 });

    } catch (error) {
        console.error(error);
        return Response.json(ApiResponse.error(500, "Error while fetching the data"), { status: 500 });
    }
}
