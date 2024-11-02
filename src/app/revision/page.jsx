import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/options";
// import Topics from "./Topics";
import { db } from "@/db/drizzle";
import { LoaderCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { course, revision, subtopics } from "@/db/schema";
import { eq } from "drizzle-orm";

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

async function fetchRevision(id) {
  try {
    const revisionData = await db.query.subject.findMany({
      with: {
        courses: {
          with: {
            topics: {
              where: (topic, { exists }) =>
                exists(
                  db
                    .select()
                    .from(subtopics)
                    .where(eq(subtopics.topic, topic.id))
                ),
              with: {
                notes: true,
                subtopics: {
                  orderBy: (subtopic, { asc }) => [asc(subtopic.subTopicIndex)],
                  where: (st, { exists, eq, or, isNull, and, sql }) =>
                    exists(
                      db
                        .select()
                        .from(revision)
                        .where(
                          and(
                            eq(revision.subtopic, st.id),
                            or(
                              isNull(revision.end),
                              sql`DATE(${revision.start}) = CURDATE()`,
                              sql`DATE(${revision.end}) = CURDATE()`
                            )
                          )
                        )
                    ),
                  with: {
                    revisions: {
                      where: (revision, { or, isNull, sql }) =>
                        or(
                          isNull(revision.end),
                          sql`DATE(${revision.start}) = CURDATE()`,
                          sql`DATE(${revision.end}) = CURDATE()`
                        ),
                    },
                  },
                },
              },
              orderBy: (topic, { asc }) => [asc(topic.topicIndex)],
            },
          },
        },
      },
      where: (subject, { exists, and, eq }) =>
        and(
          eq(subject.owner, id),
          exists(db.select().from(course).where(eq(course.subject, subject.id)))
        ),
    });

    return revisionData;
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
    const revision = await fetchRevision(session.id);

    if (!revision || revision.length <= 0) {
      return (
        <p className="text-center text-gray-500">No revision data available.</p>
      );
    }

    const data = revision
      .flatMap((data) => data.courses)
      .map((course) => ({
        ...course,
        topics: course.topics.filter((topic) => topic.subtopics.length > 0),
      }))
      .filter((course) => course.topics.length > 0);

    if (data.length <= 0)
      return (
        <p className="text-center text-gray-500">No Revision data available.</p>
      );
    return (
      <div className="container mx-auto p-4  dark:bg-gray-800">
        {data?.map((course, courseIndex) => {
          const topics = course.topics;
          if (course.topics == null) return null;
          return (
            <div
              key={`course-${courseIndex}`}
              className="mb-8 p-4 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800  "
            >
              <h2 className="text-3xl font-extrabold mb-4 text-blue-600 dark:text-darkBlueText  ">
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
