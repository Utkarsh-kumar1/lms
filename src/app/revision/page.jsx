import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/options";
// import Topics from "./Topics";
import { db } from "@/db/drizzle";
import { LoaderCircle } from "lucide-react";
import dynamic from "next/dynamic";

const Topics = dynamic(() => import("./Topics"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
        <LoaderCircle className="animate-spin text-blue-600" size={36} />
      </div>
    </div>
  ),
});

async function fetchActivity(id) {
  try {
    const data = await db.query.revisionView.findMany({
      where: (revision, { eq }) => eq(revision.userId, id),
    });

    return data;
  } catch (error) {
    throw new Error("Error while fetching the Revison Data");
  }
}

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
  }
  try {
    const activity = await fetchActivity(session.id);

    if (!activity || activity.length <= 0) {
      return (
        <p className="text-center text-gray-500">No activity data available.</p>
      );
    }

    const data = activity.filter((data) => data.topics !== null);
    if (data.length == 0)
      return (
        <>
          <p className="text-center text-gray-500">
            No activity data available.
          </p>
          <br />
          <button
            type="button"
            className="px-4 py-2 rounded-md transition-colors duration-300 shadow-sm hover:shadow-md bg-blue-500 font-bold text-xl"
          >
            Generate For Revision
          </button>
        </>
      );
    return (
      <div className="container mx-auto p-4 min-h-screen">
        {data?.map((course, courseIndex) => {
          const topics = course.topics;
          if (course.topics == null) return null;
          return (
            <div
              key={`course-${courseIndex}`}
              className="mb-8 p-4 bg-white border border-gray-200 rounded-lg shadow-md"
            >
              <h2 className="text-3xl font-extrabold mb-4 text-blue-600">
                {course.courseName}
              </h2>
              {topics?.map((topic, topicIndex) => (
                <Topics
                  topic={topic}
                  topicIndex={topicIndex}
                  key={topicIndex}
                />
              ))}
            </div>
          );
        })}
      </div>
    );
  } catch (error) {
    return <div>{error ? error.message : "Something Went Wrong"}</div>;
  }
}
