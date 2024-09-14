"use client";
import React, { useState } from "react";
import CourseCard from "../CourseCard";
import TopicCard from "@/app/topics/TopicCard";
import { IoAddCircleSharp } from "react-icons/io5";
import AddTopicForm from "@/app/topics/AddTopicForm";

export default function Course({ course, topics: initialTopic }) {
  const [topics, setTopics] = useState(initialTopic);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  function onTopicAdded(topics) {
    setTopics((prev) => [...prev, ...topics]);
    return;
  }
  return (
    <>
      <CourseCard course={course} />
      <div className="p-3">
        {topics.length === 0 ? (
          <div>No Topic Found</div>
        ) : (
          topics.map((topic, index) => (
            <TopicCard topic={topic} index={topic.topicIndex} key={index} />
          ))
        )}
      </div>
      <div className="flex items-center w-full justify-center min-h-28 flex-col">
        {isAddingTopic ? (
          <AddTopicForm
            courseId={course.id}
            subjectId={course.subjectId}
            setIsTopicAdding={setIsAddingTopic}
            onTopicAdded={onTopicAdded}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setIsAddingTopic(true);
            }}
          >
            <IoAddCircleSharp className=" size-9 sm:h-14 sm:w-14" />
          </button>
        )}
      </div>
    </>
  );
}
