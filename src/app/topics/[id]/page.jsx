
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/db/drizzle";
import { LoaderCircle } from "lucide-react";
import dynamic from "next/dynamic";
// import SubTopicContent from "@/app/subTopics/SubTopicContent";
const SubTopicContent = dynamic(
  () => import("@/app/subTopics/SubTopicContent"),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
        <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
          <LoaderCircle className="animate-spin text-blue-600" size={36} />
        </div>
      </div>
    ),
  }
);


async function fetchData(owner, topicId) {
  try {
    const subjects = await db.query.subject.findMany({
      with: {
        courses: {
          with: {
            topics: {
              with: {
                subtopics: {
                  orderBy: (subtopic, { asc }) => [asc(subtopic.subTopicIndex)],
                },
              },
              orderBy: (topic, { asc }) => [asc(topic.topicIndex)],
              where: (topic, { eq }) => eq(topic.id, topicId),
            },
          },
        },
      },
      where: (subject, { eq }) => eq(subject.owner, owner),
    });

    // Filter subjects that have courses with topics
    return subjects.filter((subject) =>
      subject.courses.some((course) => course.topics.length > 0)
    );
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
    const subjects = await fetchData(session.id, params.id);
    console.log(JSON.stringify(subjects , null , 2));
    
    if (subjects.length === 0) {
      return <div>No subjects Found</div>;
    }

    return <SubTopicContent subjects={subjects} />;
  } catch (error) {
    return (
      <div>
        {error.message ? error.message : "Error while Fetching the data"}{" "}
      </div>
    );
  }
}
