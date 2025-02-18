import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
// import SubTopicContent from "./SubTopicContent"
import { db } from "@/db/drizzle";
import { LoaderCircle } from "lucide-react";
import dynamic from "next/dynamic";

const SubTopicContent = dynamic(() => import("./SubTopicContent"), {
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
        <LoaderCircle className="animate-spin text-blue-600" size={36} />
      </div>
    </div>
  ),
});

async function fetchSubtopics(owner) {
  try {

    const subjects = await db.query.subject.findMany({
      with :{
        courses : {
          with : {
            topics : {
              with : {
                subtopics : {
                   orderBy : (subtopic ,{asc})=>[asc(subtopic.subTopicIndex)]
                }
               
              },
              orderBy : (topic ,{asc})=>[asc(topic.topicIndex)]
            }
          }
        }
      } ,
      where : (subject , {eq})=>eq(subject.owner , owner )
    })

    
    return subjects;
  } catch (error) {
    
    throw new Error("Error while fetching subtopic");
  }
}

export default async function page() {
  const session = await getServerSession(authOptions);
  
  try {
   const subjects = await fetchSubtopics(session.id);
      return <SubTopicContent subjects={subjects} />;
      
  } catch (error) {
    return (
      <div className="text-red-600 dark:text-red-400 font-bold">
        {error.message}
      </div>
    );

  }

}
