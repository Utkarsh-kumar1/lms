"use client";
import React, { useState, useEffect } from "react";
import TopicCard from "./TopicCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MultiSelect,
  SelectContent as MultiSelectContent,
  SelectItem as MultiSelectItem,
  SelectTrigger as MultiSelectTrigger,
  SelectValue as MultiSelectValue,
} from "../../components/MultiSelect";
import { IoAddCircleSharp } from "react-icons/io5";
import AddTopicForm from "./AddTopicForm";

export default function TopicContent({ topics: initialTopics }) {
  const [topics, setTopics] = useState(initialTopics);
  const [isCompleted, setIsCompleted] = useState(true);
  const [isAll, setIsAll] = useState(true);
  const [filtedSubject, setfiltedSubject] = useState([]);
  const [filtedCourses, setfiltedCourses] = useState([]);
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  // useEffect(() => {
  //   setTopics(initialTopics);
  // }, [initialTopics]);

  const subjects = Array.from(
    new Set(topics.map((topic) => topic.subjectName))
  );
  const courses = Array.from(new Set(topics.map((topic) => topic.courseName)));

  const filteredTopics = topics
    ?.filter((topic) => {
      if (filtedSubject.length === 0) {
        return true;
      } else {
        return filtedSubject.includes(topic.subjectName);
      }
    })
    ?.filter((topic) => {
      if (filtedCourses.length === 0) {
        return true;
      } else {
        return filtedCourses.includes(topic.courseName);
      }
    })
    ?.filter((topic) => {
      if (isAll) {
        return true;
      } else if (isCompleted) {
        return topic.isCompleted;
      } else {
        return !topic.isCompleted;
      }
    });

  function onTopicAdded(newTopic) {
    console.log(newTopic);
    
    setTopics((prevTopics) => [...prevTopics, ...newTopic]);
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Topics</h1>
        <div className="flex mt-4 rounded-md border-2 gap-2 md:gap-6 p-4 sm:items-center flex-col sm:flex-row items-start justify-start">
          <p className="">Filter :</p>
          <MultiSelect
            onChange={(value) => {
              setfiltedSubject(value);
            }}
          >
            <MultiSelectTrigger className="w-[180px]">
              <MultiSelectValue placeholder="All" />
            </MultiSelectTrigger>
            <MultiSelectContent>
              {subjects?.map((subject, index) => (
                <MultiSelectItem key={index} value={subject}>
                  {subject}
                </MultiSelectItem>
              ))}
            </MultiSelectContent>
          </MultiSelect>
          <MultiSelect
            onChange={(value) => {
              setfiltedCourses(value);
            }}
          >
            <MultiSelectTrigger className="w-[180px]">
              <MultiSelectValue placeholder="All" />
            </MultiSelectTrigger>
            <MultiSelectContent>
              {courses?.map((course, index) => (
                <MultiSelectItem key={index} value={course}>
                  {course}
                </MultiSelectItem>
              ))}
            </MultiSelectContent>
          </MultiSelect>
          <Select
            defaultValue="All"
            onValueChange={(data) => {
              if (data === "Completed") {
                setIsAll(false);
                setIsCompleted(true);
              } else if (data === "UnCompleted") {
                setIsAll(false);
                setIsCompleted(false);
              } else if (data === "All") {
                setIsAll(true);
              }
            }}
          >
            <SelectTrigger className="w-[180px] bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="UnCompleted">UnCompleted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-4">
        {filteredTopics.length > 0 ? (
          filteredTopics?.map((topic, index) => (
            <TopicCard key={topic.id} index={index} topic={topic} />
          ))
        ) : (
          <p className="text-lg text-gray-500">
            No topics Found.
          </p>
        )}
      </div>
      <div className="flex items-center w-full justify-center min-h-28 flex-col">
        {isAddingTopic ? (
          <AddTopicForm
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
            <IoAddCircleSharp className="size-9 sm:h-14 sm:w-14" />
          </button>
        )}
      </div>
    </div>
  );
}
