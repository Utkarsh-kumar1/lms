import dbconnect from "@/lib/dbconnect";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Subject from "./Subject";

async function fetchSubject(owner, subjectId) {
  const pool = dbconnect();
  try {
    const [subjects] = await pool.execute(
      "SELECT id , subjectName , isCompleted , isActive FROM subject WHERE id = ? AND OWNER = ? ;",
      [subjectId, owner]
    );

    const [courses] = await pool.execute(
      "SELECT c.*  FROM `course` c JOIN `subject` s ON c.subject = s.id WHERE s.owner = ? and s.id = ?;",
      [owner , subjectId]
    );

    return { subjects, courses };
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
    const { subjects, courses } = await fetchSubject(session.id, params.id);
    if (subjects.length === 0) {
      return <div>No subjects Found</div>;
    }

    return (
      <Subject courses={courses} subjects={subjects} />
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
