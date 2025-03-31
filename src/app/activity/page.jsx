import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/options";
import Topics from "./Topics";
import { db } from "@/db/drizzle";
import {
  activity,
  course,
  subject,
  subtopics,
  topics,
} from "@/db/schema";
import { and, eq, isNull, not, or, sql } from "drizzle-orm";
import { raw } from "mysql2";

// 1. Get all active and not completed courses for user
async function getAllCourses(userId) {
  try {
    const courses = await db
      .select({
        subjectId: subject.id,
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
   
    throw error;
  }
}

// 2. Get subtopics using courseId where the activity is not yet generated
const getTopicsByCourse = async (
  subjectId,
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
      subjectId: subjectId,
      courseId: courseId,
      courseName: courseName,
      courseSession: sessionNo,
      ...d,
    }));

    return dataWithAllFields;
  } catch (error) {
   
  }
};

// Get subtopics where activity is not yet created using functions 1 and 2 
const fetchCoursesAndTopics = async (userId) => {
  try {
    const courses = await getAllCourses(userId);
    const coursesWithTopics = await Promise.all(
      courses.map(async (course) => {
        const topicsData = await getTopicsByCourse(
          course.subjectId,
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

// Get all activities which is either not completed or generated today
async function fetchActivity(id) {
  const coursesAndTopicsToSchedule = await fetchCoursesAndTopics(id);

  const data = await db
    .select({
      subjectId: subject.id,
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
      activityEnd: activity.end
    })
    .from(subject)
    .innerJoin(course, eq(course.subject, subject.id))
    .innerJoin(topics, eq(topics.course, course.id))
    .innerJoin(subtopics, eq(subtopics.topic, topics.id))
    .innerJoin(activity, eq(activity.subTopic, subtopics.id))
    .where(
      and(
        or(
          eq(raw("Date(activity.end)"), raw("CURDATE()")),
          isNull(activity.end)
        ),
        eq(activity.owner, id)
      )
    )
    .orderBy(course.created, topics.topicIndex, subtopics.subTopicIndex);
  const finalData = [...data, ...coursesAndTopicsToSchedule];

  return {
    props: {
      finalData,
    },
    // Revalidate every 10 seconds
    revalidate: 10,
  };
}

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
    return null;
  }

  const activity = (await fetchActivity(session.id)).props.finalData;

  if (!activity || activity.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:bg-gray-400 dark:text-white">No activity data available.</p>
    );
  }

  return (
    <div className="container mx-auto p-4 dark:bg-gray-800"
      
    >
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
                className="mb-8 p-4 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-slate-800"
              >
                <h2 className="text-3xl font-extrabold mb-4 text-blue-600 dark:text-darkBlueText">
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
                    const topics = activity.filter(
                      (activity) =>
                        activity.courseId === course.courseId &&
                        activity.topicId === topic.topicId
                    );

                    return (
                      <Topics
                        key={`topic-${topicIndex}`}
                        topicIndex={topicIndex}
                        topics={topics} // Pass filtered subtopics
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
