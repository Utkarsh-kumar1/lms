import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/db/drizzle";
// import TopicContent from "@/app/topics/TopicContent";
import dynamic from "next/dynamic";
import { LoaderCircle } from "lucide-react";
const TopicContent = dynamic(() => import("@/app/topics/TopicContent"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
        <LoaderCircle className="animate-spin text-blue-600" size={36} />
      </div>
    </div>
  ),
});
async function fetchSubject(owner, courseId) {
  try {
    const subjects = await db.query.subject.findMany({
      with: {
        courses: {
          with: {
            topics: {
              with: {
                notes: true,
              },
              orderBy  : (topic , {asc})=>[asc(topic.topicIndex)]
            },

          },
          where : (course , {eq})=>eq(course.id , courseId)
        },
      },
      where: (course, { eq }) => eq(course.owner, owner),
    });

    return subjects.filter(subject=>subject.courses.length > 0 );
  } catch (error) {

    throw new Error("Error while fetching Data");
  }
}

export default async function page({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <div>Unauthorized Access</div>;
  }
  try {
    const subjects = await fetchSubject(session.id, params.id);
    if (subjects.length === 0) {
      return <div>No subjects Found</div>;
    }

    return (
      <>
        <TopicContent subjects={subjects} />
      </>
    );
  } catch (error) {
    return (
      <div>
        {" "}
        {error.message ? error.message : "Error while Fetching the data"}{" "}
      </div>
    );
  }
}
