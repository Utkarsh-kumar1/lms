import { getServerSession } from "next-auth";
import Dashboard from "./Dashboard";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { db } from "@/db/drizzle";
import { sql } from "drizzle-orm";
import { quotes } from "@/db/schema";

async function fetchChartLineData(id) {
  // Fetch activities and revisions for the last 6 days for chart data
  const result = await db.query.users.findFirst({
    columns: {},
    with: {
      activities: {
        where: (activities, { between, sql }) =>
          between(
            sql`DATE(${activities.end})`,
            sql`DATE(NOW() - INTERVAL 6 DAY)`,
            sql`DATE(NOW())`
          ),
        columns: {
          end: true,
        },
      },
      revisions: {
        where: (revisions, { between, sql }) =>
          between(
            sql`DATE(${revisions.end})`,
            sql`DATE(NOW() - INTERVAL 6 DAY)`,
            sql`DATE(NOW())`
          ),
        columns: {
          end: true,
        },
      },
      dailyActivitiesScheduleds: {
        where: (dailyActivitiesScheduleds, { between, sql, and, eq }) =>
          and(
            between(
              sql`DATE(${dailyActivitiesScheduleds.startDate})`,
              sql`DATE(NOW() - INTERVAL 6 DAY)`,
              sql`DATE(NOW())`
            ),
            eq(dailyActivitiesScheduleds.isCompleted, true)
          ),
        columns: {
          startDate: true,
        },
      },
    },
    where: (user, { eq }) => eq(user.id, id),
  });


  // Helper function to get the name of the day
  const getDayName = (date) =>
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];

  // Helper function to get the dates for the last 6 days
  const getLast6Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        dayName: getDayName(date),
        date,
      });
    }

    return days;
  };

  const processResults = (data) => {
    return data.reduce((acc, item) => {
      const dayName = getDayName(new Date(item.end || item.startDate));
      acc[dayName] = (acc[dayName] || 0) + 1;
      return acc;
    }, {});
  };

  const activityCounts = processResults(result.activities);
  const revisionCounts = processResults(result.revisions);
  const dailyActivitiesScheduledsCounts = processResults(
    result.dailyActivitiesScheduleds
  );

  // Get the last 6 days in the correct order
  const last6Days = getLast6Days();

  // Map the results to match the last 6 days
  const activityResult = last6Days.map(({ dayName }) => ({
    id: "activity",
    x: dayName,
    y: activityCounts[dayName] || 0,
  }));

  const revisionResult = last6Days.map(({ dayName }) => ({
    id: "revision",
    x: dayName,
    y: revisionCounts[dayName] || 0,
  }));
  const dailyActivitiesScheduledsResult = last6Days.map(({ dayName }) => ({
    id: "DailyActivity",
    x: dayName,
    y: dailyActivitiesScheduledsCounts[dayName] || 0,
  }));


  // Format the final response for Nivo
  return [
    {
      id: "activity",
      color: "hsl(81, 70%, 50%)",
      data: activityResult,
    },
    {
      id: "revision",
      color: "hsl(70, 70%, 50%)",
      data: revisionResult,
    },
    {
      id: "DailyActivity",
      color: "hsl(70, 70%, 50%)",
      data: dailyActivitiesScheduledsResult,
    },
  ];
}

async function fetchData(id) {
  try {
    const chartLineData = fetchChartLineData(id);
    const user = db.query.users.findFirst({
      with: {
        dailyActivitiesScheduleds: {
          where: (dailyActivitiesSchedules, { and, eq, sql }) =>
            eq(
              sql`Date(${dailyActivitiesSchedules.startDate})`,
              sql`CURRENT_DATE()`
            ),
        },

      },
      where: (user, { eq }) => eq(user.id, id),
    });
    
    // Getting quote of the day
    const getQuoteWithTodayColumn = db.select()
      .from(quotes)
      .where(sql`${quotes.today} = 1`);
    
    // Getting micro planner tasks
    const getMicroPlannerTasks = db.query.microPlanner.findMany({
      where: (microMonitorTasks, { eq }) => eq(microMonitorTasks.owner, id),
    });
    
    const result = await Promise.all([user, chartLineData, getQuoteWithTodayColumn, getMicroPlannerTasks]);
    
    const userData = { ...result[0], chartLineData: result[1], quote: result[2], microPlannerTasks: result[3] };

    // console.log(userData);

    return userData;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching Data");
  }
}

export default async function Page() {
  const session = await getServerSession(authOptions);

  try {
    const userData = await fetchData(session.id);

    return (
      
        <Dashboard userData={userData} />
      
    );
  } catch (error) {
    return <div className=" text-green-600 font-bold"> {error.message} </div>;
  }
}
