import dbconnect from "@/lib/dbconnect";
import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import CourseContent from "./CourseContent";


async function fetchSubject(id) {
  const pool = dbconnect();
  try {
    const [courses] = await pool.execute(
      "SELECT c.* , s.subjectName  FROM `course` c JOIN `subject` s ON c.subject = s.id WHERE s.owner = ?;",
      [id]
    );

    return courses;
  } catch (error) {
    throw new Error("Error while fetching Data");
  }
}

export default async function page() {
  const session = await getServerSession(authOptions);
  let courses = null;
  try {
    courses = await fetchSubject(session.id);
  } catch (error) {
    return <div> {error.message} </div>;
  }



  return (
    <>
      <CourseContent courses={courses} />
    </>
  );
  
}
