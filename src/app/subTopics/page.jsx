import dbconnect from "@/lib/dbconnect";
import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import SubTopicContent from "./SubTopicContent";

async function fetchSubtopics(id) {
  const pool = dbconnect();
  try {
    const [subtopics] = await pool.execute(
      "SELECT st.*,t.topicName , c.courseName, s.subjectName FROM subtopics st JOIN topics t ON st.topic = t.id JOIN course c ON t.course = c.id JOIN subject s ON c.subject = s.id WHERE s.owner = ? ORDER BY t.topicIndex , st.subtopicIndex ; ",
      [id]
    );

    return subtopics;
  } catch (error) {
    console.log(error);
    
    throw new Error("Error while fetching subtopic");
  }
}

export default async function page() {
  const session = await getServerSession(authOptions);
  let subtopics = null;
  try {
    subtopics = await fetchSubtopics(session.id);
  } catch (error) {
    return <div className=" text-red-600 font-bold"> {error.message} </div>;
  }


  return (
    <>
      <SubTopicContent subtopics={subtopics} />
    </>
  );
}
