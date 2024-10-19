import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/options";
import Topics from "./Topics";
import { db } from "@/db/drizzle";
import { activity, course, subject, subtopics, topics } from "@/db/schema";
import { and, eq, isNull, not, or, sql } from "drizzle-orm";
import { raw } from "mysql2";

async function getAllCourses(userId) {
  try {
    const courses = await db
      .select({
        courseId: course.id,
        courseName: course.courseName,
        session: course.session,
      })
      .from(course)
      .leftJoin(subject, eq(course.subject, subject.id))
      .where(
        and(
          eq(subject.owner, userId),
          eq(course.isActive, true),
          not(eq(course.isCompleted, true))
        )
      );
    return courses;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
}

// Function to get topics by course ID with pagination
const getTopicsByCourse = async (
  courseId,
  courseName,
  sessionNo,
  limit = 1,
  offset = 0
) => {
  try {
    const data = await db
      .select({
        topicId: topics.id,
        topicIndex: topics.topicIndex,
        topicName: topics.topicName,
        subtopicId: subtopics.id,
        subtopicName: subtopics.subtopicName,
        subTopicIndex: subtopics.subTopicIndex,
      })
      .from(topics)
      .leftJoin(subtopics, eq(subtopics.topic, topics.id))
      .leftJoin(
        activity,
        and(
          eq(activity.subTopic, subtopics.id),
          eq(activity.session, sessionNo)
        )
      )
      .where(
        and(
          eq(topics.course, courseId),
          not(eq(topics.isCompleted, true)),
          not(eq(subtopics.isCompleted, true)),
          sql`activity.id IS NULL`
        )
      )
      .orderBy(topics.topicIndex, subtopics.subTopicIndex)
      .limit(limit)
      .offset(offset);

    const dataWithAllFields = data.map((d) => ({
      courseId: courseId,
      courseName: courseName,
      courseSession: sessionNo,
      ...d,
    }));

    return dataWithAllFields;
  } catch (error) {
    console.error("Error fetching topics and subtopics:", error);
  }
};

// Fetch courses and topics
const fetchCoursesAndTopics = async (userId) => {
  try {
    const courses = await getAllCourses(userId);
    const coursesWithTopics = await Promise.all(
      courses.map(async (course) => {
        const topicsData = await getTopicsByCourse(
          course.courseId,
          course.courseName,
          course.session
        );
        return topicsData;
      })
    );

    return coursesWithTopics.flat();
  } catch (error) {
    // setError('Failed to fetch data');
  }
};

async function fetchActivity(id) {
  const coursesAndTopicsToSchedule = await fetchCoursesAndTopics(id);

  const data = await db
    .select({
      courseId: course.id,
      courseName: course.courseName,
      topicId: topics.id,
      topicName: topics.topicName,
      topicIndex: topics.topicIndex,
      subtopicId: subtopics.id,
      subtopicName: subtopics.subtopicName,
      subTopicIndex: subtopics.subTopicIndex,
      activityId: activity.id,
      activityStart: activity.start,
      activityEnd: activity.end,
    })
    .from(course)
    .innerJoin(topics, eq(topics.course, course.id))
    .innerJoin(subtopics, eq(subtopics.topic, topics.id))
    .innerJoin(activity, eq(activity.subTopic, subtopics.id))
    .where(
      and(
        or(
          eq(raw("Date(activity.start)"), raw("CURDATE()")),
          isNull(activity.end)
        ),
        eq(activity.owner, id)
      )
    )
    .orderBy(course.created, topics.topicIndex, subtopics.subTopicIndex);
  return [...data, ...coursesAndTopicsToSchedule];
}

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
    return null;
  }

  const activity = await fetchActivity(session.id);

  if (!activity || activity.length === 0) {
    return (
      <p className="text-center text-gray-500">No activity data available.</p>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      {
        // Filter unique courses from the flat JSON data
        activity
          .filter(
            (course, index, self) =>
              self.findIndex((c) => c.courseId === course.courseId) === index
          )
          .map((course, courseIndex) => {
            // Filter topics related to the current course
            const topics = activity.filter(
              (activity) => activity.courseId === course.courseId
            );

            return (
              <div
                key={`course-${courseIndex}`}
                className="mb-8 p-4 bg-white border border-gray-200 rounded-lg shadow-md"
              >
                <h2 className="text-3xl font-extrabold mb-4 text-blue-600">
                  {course.courseName}
                </h2>
                {topics
                  .filter(
                    (topic, index, self) =>
                      self.findIndex((t) => t.topicId === topic.topicId) ===
                      index
                  )
                  .map((topic, topicIndex) => {
                    // Filter subtopics for the current topic
                    const subtopics = activity.filter(
                      (activity) =>
                        activity.courseId === course.courseId &&
                        activity.topicId === topic.topicId
                    );

                    return (
                      <Topics
                        key={`topic-${topicIndex}`}
                        topic={topic}
                        topicIndex={topicIndex}
                        subjectId={course.subjectId}
                        courseId={course.courseId}
                        subtopics={subtopics} // Pass filtered subtopics
                      />
                    );
                  })}
              </div>
            );
          })
      }
    </div>
  );
}
