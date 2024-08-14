import dbconnect from "@/lib/dbconnect";
import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import SubjectContent from "./SubjectContent";

async function fetchSubject(id) {
  const pool = dbconnect();
  try {
    const [subjects] = await pool.execute(
      "SELECT id , subjectName , isCompleted , isActive FROM subject WHERE OWNER = ? ;",
      [id]
    );

    return subjects;
  } catch (error) {
    throw new Error("Error while fetching Data");
  }
}

export default async function page() {
  const session = await getServerSession(authOptions);
  let subjects = null;
  try {
    subjects = await fetchSubject(session.id);
  } catch (error) {
    return <div> {error.message} </div>;
  }



  return (
    <SubjectContent subjects={subjects}/>
  );
}
