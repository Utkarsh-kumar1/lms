"use client";
import React, { useState } from "react";
import TopicCard from "../TopicCard";
import SubTopicCard from "@/app/subTopics/SubTopicCard";
import { IoAddCircleSharp } from "react-icons/io5";
import AddSubtopicForm from "@/app/subTopics/AddSubtopicForm";

export default function Topic({ topic, subtopics }) {
  const [issubTopicAdding, setIssubTopicAdding] = useState(false);

  console.log(subtopics);
  
  function onSubtopicAdded(subtopic) {
    subtopics.push(...subtopic);
  }

  return (
    <>
      <TopicCard topic={topic} />
      <div className="p-5">
        {subtopics.length === 0 ? (
          <div>No subtopic Found</div>
        ) : (
          subtopics.map((subtopic, index) => {
            console.log("subtopics in map " ,subtopic);
            
            return <SubTopicCard subtopic={subtopic} index={index} key={index} />
          })
        )}
      </div>
      <div className="flex items-center w-full justify-center min-h-28 flex-col">
        {issubTopicAdding ? (
          <AddSubtopicForm
            setIsSubTopicAdding={setIssubTopicAdding}
            onSubtopicAdded={onSubtopicAdded}
            courseId={topic.courseId}
            topicId={topic.id}
            subjectId={topic.subjectId}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setIssubTopicAdding(true);
            }}
          >
            <IoAddCircleSharp className=" size-9 sm:h-14 sm:w-14" />
          </button>
        )}
      </div>
    </>
  );
}
