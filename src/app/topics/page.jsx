import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { db } from "@/db/drizzle";
import dynamic from "next/dynamic";
import { LoaderCircle } from "lucide-react";
const TopicContent = dynamic(() => import("./TopicContent"), {
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
        <LoaderCircle className="animate-spin text-blue-600" size={36} />
      </div>
    </div>
  ),
});

async function fetchTopics(id) {
  try {
    const subjects = await db.query.subject.findMany({
      with: {
        courses: {
          with: {
            topics: {
              with: {
                notes: true,
              },
              orderBy: (topics, { asc }) => [asc(topics.topicIndex)],
            },
          },
        },
      },
      where: (subject, { eq }) => eq(subject.owner, id),
    });
    return subjects;
  } catch (error) {
    throw new Error("Error while fetching Topics");
  }
}

export default async function page() {
  const session = await getServerSession(authOptions);
  try {
    const subjects = await fetchTopics(session.id);
    return <TopicContent subjects={subjects} />;
  } catch (error) {
    return <div className=" text-red-600 font-bold dark:bg-gray-800 "> {error.message} </div>;
  }
}
