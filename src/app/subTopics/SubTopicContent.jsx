"use client";
import React, { useState, useEffect } from "react";
import SubTopicCard from "./SubTopicCard";
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
import AddSubtopicForm from "./AddSubtopicForm";

export default function TopicContent({ subtopics: initialSubtopics }) {
  const [subtopics, setSubtopics] = useState(initialSubtopics);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAll, setIsAll] = useState(true);
  const [filtedSubject, setFiltedSubject] = useState([]);
  const [filtedCourses, setFiltedCourses] = useState([]);
  const [filtedTopics, setFiltedTopics] = useState([]);
  const [issubTopicAdding, setIsSubTopicAdding] = useState(false);

  // useEffect(() => {
  //   setSubtopics(initialSubtopics);
  // }, [initialSubtopics]);

  const subjects = Array.from(
    new Set(subtopics.map((subtopic) => subtopic.subjectName))
  );
  const courses = Array.from(
    new Set(subtopics.map((subtopic) => subtopic.courseName))
  );
  const topics = Array.from(
    new Set(subtopics.map((subtopic) => subtopic.topicName))
  );

  const filteredSubtopics = subtopics
    ?.filter(
      (subtopic) =>
        filtedSubject.length === 0 ||
        filtedSubject.includes(subtopic.subjectName)
    )
    .filter(
      (subtopic) =>
        filtedCourses.length === 0 ||
        filtedCourses.includes(subtopic.courseName)
    )
    .filter(
      (subtopic) =>
        filtedTopics.length === 0 || filtedTopics.includes(subtopic.topicName)
    )
    .filter(
      (subtopic) =>
        isAll || (isCompleted ? subtopic.isCompleted : !subtopic.isCompleted)
    );

  function onSubtopicAdded(AddedSubtopics) {
    console.log(AddedSubtopics);
    setSubtopics((prevSubtopics) => [...prevSubtopics, ...AddedSubtopics]);
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Subtopics</h1>
        <div className="flex mt-4 rounded-md border-2 gap-2 md:gap-6 p-4 sm:items-center flex-col sm:flex-row items-start justify-start">
          <p>Filter :</p>
          <MultiSelect onChange={(value) => setFiltedSubject(value)}>
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
          <MultiSelect onChange={(value) => setFiltedCourses(value)}>
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
          <MultiSelect onChange={(value) => setFiltedTopics(value)}>
            <MultiSelectTrigger className="w-[180px]">
              <MultiSelectValue placeholder="All" />
            </MultiSelectTrigger>
            <MultiSelectContent>
              {topics?.map((topic, index) => (
                <MultiSelectItem key={index} value={topic}>
                  {topic}
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
              } else {
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
        {filteredSubtopics.length > 0 ? (
          filteredSubtopics?.map((subtopic, index) => (
            <SubTopicCard key={subtopic.id} index={subtopic.subTopicIndex} subtopic={subtopic} />
          ))
        ) : (
          <p className="text-lg text-gray-500">
            No subtopics Found.
          </p>
        )}
      </div>
      <div className="flex items-center w-full justify-center min-h-28 flex-col">
        {issubTopicAdding ? (
          <AddSubtopicForm
            setIsSubTopicAdding={setIsSubTopicAdding}
            onSubtopicAdded={onSubtopicAdded}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setIsSubTopicAdding(true);
            }}
          >
            <IoAddCircleSharp className="size-9 sm:h-14 sm:w-14" />
          </button>
        )}
      </div>
    </div>
  );
}
