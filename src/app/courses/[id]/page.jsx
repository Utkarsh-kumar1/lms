import dbconnect from "@/lib/dbconnect";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import CourseCard from "@/app/courses/CourseCard";
import TopicCard from "@/app/topics/TopicCard";
import Course from "./Course";

async function fetchSubject(owner, courseId) {
  const pool = dbconnect();
  try {
    const [courses] = await pool.execute(
      "SELECT c.* , s.id AS subjectId FROM `course` c JOIN `subject` s ON c.subject = s.id WHERE s.owner = ? AND c.id = ?;",
      [owner , courseId]
    );

      const [topics] = await pool.execute(
        "SELECT t.* FROM topics t JOIN course c ON t.course = c.id JOIN subject s ON c.subject = s.id WHERE s.owner = ? AND c.id = ?",
        [owner , courseId]
      );


    return { courses , topics};
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
    const { courses, topics } = await fetchSubject(session.id, params.id);
    if (courses.length === 0) {
      return <div>No subjects Found</div>;
    }

    return (
      <Course course={courses[0]} topics={topics} />
      // <>
      //   <CourseCard course={courses[0]} />
      //   <div className="p-3">
      //     {topics.length === 0 ? (
      //       <div>No Topic Found</div>
      //     ) : (
      //       topics.map((topic, index) => (
      //         <TopicCard topic={topic} index={index} key={index} />
      //       ))
      //     )}
      //   </div> 
      // </>
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
