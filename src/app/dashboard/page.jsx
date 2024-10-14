import { getServerSession } from "next-auth";
import Dashboard from "./Dashboard";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { db } from "@/db/drizzle";

async function fetchData(id) {
  try {
    const userData = await db.query.users.findFirst({
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
