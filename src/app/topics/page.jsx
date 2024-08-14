import dbconnect from "@/lib/dbconnect";
import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import TopicContent from "./TopicContent";

async function fetchTopics(id) {
  const pool = dbconnect();
  try {
    const [topics] = await pool.execute(
      "SELECT t.*, c.courseName, s.subjectName FROM topics t JOIN course c ON t.course = c.id JOIN subject s ON c.subject = s.id WHERE s.owner = ?",
      [id]
    );

    return topics;
  } catch (error) {
    throw new Error("Error while fetching Topics");
  }
}

export default async function page() {
  const session = await getServerSession(authOptions);
  let topics = null;
  try {
    topics = await fetchTopics(session.id);
  } catch (error) {
    return <div className=" text-red-600 font-bold"> {error.message} </div>;
  }



  return (
    <>
      <TopicContent  topics={topics} />
    </>
  );
}
