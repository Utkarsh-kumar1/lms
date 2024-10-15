import { getServerSession } from "next-auth";
import Dashboard from "./Dashboard";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { db } from "@/db/drizzle";

async function fetchChartLineData(id) {
  // Fetch activities and revisions for the last 6 days
  const result = await db.query.users.findFirst({
    columns: {},
    with: {
      activities: {
        where: (activities, { between, sql }) =>
          between(activities.end, sql`NOW() - INTERVAL 6 DAY`, sql`NOW()`),
        columns: {
          end: true,
        },
      },
      revisions: {
        where: (revisions, { between, sql }) =>
          between(revisions.end, sql`NOW() - INTERVAL 6 DAY`, sql`NOW()`),
        columns: {
          end: true,
        },
      },
      dailyActivitiesScheduleds: {
        where: (dailyActivitiesScheduleds, { between, sql, and, eq }) =>
          and(
            between(
              dailyActivitiesScheduleds.startDate,
              sql`NOW() - INTERVAL 6 DAY`,
              sql`NOW()`
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
        dailyActivitiesScheduledsView: {
          where: (dailyActivitiesSchedules, { and, eq, sql }) =>
            eq(
              sql`Date(${dailyActivitiesSchedules.startDate})`,
              sql`CURRENT_DATE()`
            ),
        },
      },
      where: (user, { eq }) => eq(user.id, id),
    });

    const result = await Promise.all([user, chartLineData]);

    const userData = { ...result[0], chartLineData: result[1] };

    return userData;
  } catch (error) {

    throw new Error("Error while fetching Data");
  }
}

export default async function Page() {
  const session = await getServerSession(authOptions);

  try {
    const userData = await fetchData(session.id);

    return (
      <div className="w-full ">
        <Dashboard userData={userData} />
      </div>
    );
  } catch (error) {
    return <div className=" text-green-600 font-bold"> {error.message} </div>;
  }
}
