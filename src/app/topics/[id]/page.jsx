import dbconnect from "@/lib/dbconnect";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import TopicCard from "@/app/topics/TopicCard";
import SubTopicCard from "@/app/subTopics/SubTopicCard";
import Topic from "./Topic";

async function fetchSubject(owner, topicId) {
  const pool = dbconnect();
  try {
    const [topics] = await pool.execute(
      "SELECT t.* , c.id AS courseId , s.id AS subjectId FROM topics t JOIN course c ON t.course = c.id JOIN subject s ON c.subject = s.id WHERE s.owner = ? AND t.id = ?",
      [owner, topicId]
    );
    console.log(topics);
     const [subtopics] = await pool.execute(
       "SELECT st.* FROM subtopics st JOIN topics t ON st.topic = t.id JOIN course c ON t.course = c.id JOIN subject s ON c.subject = s.id WHERE s.owner = ? AND t.id = ? ; ",
       [owner , topicId]
     );
    console.log(subtopics);

    return { subtopics, topics };
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
    const { subtopics, topics } = await fetchSubject(session.id, params.id);
    if (topics.length === 0) {
      return <div>No subjects Found</div>;
    }

    return (
      <Topic subtopics={subtopics} topic={topics[0]} />
      // <>
      //   <TopicCard topic={topics[0]} />
      //   <div className="p-5">
      //     {topics.length === 0 ? (
      //       <div>No topic Found</div>
      //     ) : (
      //       subtopics.map((subtopic, index) => (
      //         <SubTopicCard subtopic={subtopic} index={index} key={index} />
      //       ))
      //     )}
      //   </div>
      // </>
    );
  } catch (error) {
    console.log(error);
    
    return (
      <div>
        {" "}
        {error.message ? error.message : "Error while Fetching the data"}{" "}
      </div>
    );
  }
}
