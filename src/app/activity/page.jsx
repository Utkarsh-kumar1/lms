import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/options";
import Topics from "./Topics";
import { db } from "@/db/drizzle";
import CreateNewActivities from "./CreateNewActivities";
import { activity, course, subject, subtopics, topics } from "@/db/schema";
import { and, eq, not, sql } from "drizzle-orm";

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
    console.log(courses);
    // console.log("logged");
    return courses;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
}

// Function to get topics by course ID with pagination
const getTopicsByCourse = async (courseId, sessionNo, limit = 1, offset = 0) => {
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
      .where(and(
        eq(topics.course, courseId),
        not(eq(topics.isCompleted, true)),
        not(eq(subtopics.isCompleted, true)),
                sql`activity.id IS NULL`
      ))
      .orderBy(topics.topicIndex, subtopics.subTopicIndex)
      .limit(limit)
      .offset(offset);

    return data;
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
        const topicsData = await getTopicsByCourse(course.courseId, course.session);
        return { ...course, subtopics: topicsData };
      })
    );
    console.log(coursesWithTopics);
    return coursesWithTopics;
  } catch (error) {
    // setError('Failed to fetch data');
  }
};

async function fetchActivity(id) {
  const coursesAndTopicsToSchedule = await fetchCoursesAndTopics(id);

  const data = await db.query.activityView.findMany({
    where: (activityview, { eq }) => eq(activityview.userId, id),
  });

  return data;
}

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
    return null;
  }

  const coursesAndTopicsToSchedule = await fetchCoursesAndTopics(session.id);
  const activity = await fetchActivity(session.id);

  if (!activity || activity.length === 0) {
    return (
      <p className="text-center text-gray-500">No activity data available.</p>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <CreateNewActivities data={coursesAndTopicsToSchedule} />
      {activity?.map((course, courseIndex) => {
        const topics = course.topics;
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
                subjectId={course.subjectId}
                courseId={course.courseId}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
