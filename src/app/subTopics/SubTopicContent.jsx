"use client";
import React, { useEffect, useState } from "react";
import { IoAddCircleSharp } from "react-icons/io5";

import { Check, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SubTopicCard from "./SubTopicCard";
import { AddSubTopics } from "@/actions/AddSubTopics";

export default function SubTopicContent({ subjects = [] }) {
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [topicName, setTopicName] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [errors, setErrors] = useState({ errorWhileSavingData: "" });

  // Update courses based on the selected subject
  useEffect(() => {
    if (selectedSubject) {
      const subject = subjects.find((s) => s.id === selectedSubject);
      setFilteredCourses(subject?.courses || []); // Default to empty array to prevent errors
    } else {
      setFilteredCourses([]); // Clear courses when subject is deselected
    }
  }, [selectedSubject ]); // Only re-run if `selectedSubject` changes
  useEffect(() => {
    if (selectedCourse) {
      
      const course = filteredCourses.find((c) => c.id === selectedCourse);
      setFilteredTopics(course?.topics || []); // Default to empty array to prevent errors
    } else {
      setFilteredTopics([]); // Clear courses when subject is deselected
    }
  }, [selectedCourse , filteredCourses]); // Only re-run if `selectedSubject` changes

  return (
    <div className="p-3 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Topics & SubTopic
          </h1>
          <p className="text-gray-600">Explore your topic, and subTopic .</p>
        </div>

        {/* Add Topic Button */}
        <button
          type="button"
          onClick={() => setIsAddingTopic(true)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition"
        >
          <IoAddCircleSharp className="h-8 w-8 mr-2" />
          <span className="text-lg">Add Subtopic</span>
        </button>
      </div>

      <div className="space-y-5">
        {subjects.length > 0 ? (
          subjects
            .flatMap((subject) => subject.courses)
            .map((course, courseIndex) => {
              return course.topics?.length > 0 ? (
                <div
                  key={courseIndex}
                  className="border border-gray-200 bg-white rounded-md shadow-md p-4"
                >
                  {/* Subject Name */}
                  <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
                    {course.courseName}
                  </h2>

                  {/* Display Courses under the Subject */}
                  {course.topics?.length > 0 ? (
                    course.topics.map((topic, topicIndex) => (
                      <div
                        key={topicIndex}
                        className="mt-4 border-l-4 pl-6 border-indigo-300"
                      >
                        {/* Course Name */}
                        <h3 className="text-xl font-medium text-gray-800 flex items-center mb-4">
                          📘 {topic.topicName}
                        </h3>

                        {/* Display Topics under the Course */}
                        {topic?.subtopics?.length > 0 ? (
                          topic.subtopics.map((subtopic) => (
                            <SubTopicCard
                              subtopic={subtopic}
                              key={subtopic.id}
                              courseId={course.id}
                              subjectId={course.subject}
                              topicId={topic.id}
                            />
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            No SubTopics found for this Topic.
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No courses found under this subject.
                    </p>
                  )}
                </div>
              ) : null;
            })
        ) : (
          <p className="text-lg text-gray-500">No subjects found.</p>
        )}
      </div>

      {/* Add Topic Form */}
      {isAddingTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-2">
          <form
            className="p-6 rounded-lg shadow-lg bg-white max-w-lg w-full flex flex-col gap-6"
            action={async (e) => {
              const subtopicNames = e
                .get("subtopicName")
                .split(";")
                .map((topic) => topic.trim());
              const subjectId = e.get("subjectId");
              const courseId = e.get("courseId");
              const topicId = e.get("topicId");
              const { error, success } = await AddSubTopics(subtopicNames , subjectId , courseId , topicId)

              if (success) {
                setIsAddingTopic(false);
                setTopicName("");
                selectedCourse("");
                selectedSubject("");
              }
              if (error) {
                setErrors((prev) => ({ ...prev, errorWhileSavingData: error }));
              }
            }}
          >
            <h3 className="text-lg font-bold mb-4">Add SubTopic</h3>

            {/* Topic Name Input */}
            <input
              name="subtopicName"
              type="text"
              placeholder="Enter SubTopic Name (semicolon Separated)"
              className="p-3 border-b w-full outline-none text-sm sm:text-lg placeholder:"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              required
            />

            {/* Subject Selection */}
            <Select
              onValueChange={(value) => {
                setSelectedSubject(value);
                setSelectedCourse(null); // Reset course selection when subject changes
              }}
              value={selectedSubject || ""}
              required
              name="subjectId"
            >
              <SelectTrigger className="w-full bg-white border rounded-md shadow-sm p-3 ">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Course Selection (disabled until subject is selected) */}
            <Select
              onValueChange={(value) => setSelectedCourse(value)}
              value={selectedCourse || ""}
              required
              disabled={!selectedSubject}
              name="courseId"
            >
              <SelectTrigger
                className={`w-full bg-white border rounded-md shadow-sm p-3 ${
                  !selectedSubject ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {filteredCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.courseName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) => setSelectedTopic(value)}
              value={selectedTopic || ""}
              required
              disabled={!selectedCourse}
              name="topicId"
            >
              <SelectTrigger
                className={`w-full bg-white border rounded-md shadow-sm p-3 ${
                  !selectedCourse ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <SelectValue placeholder="Select Topic" />
              </SelectTrigger>
              <SelectContent>
                {filteredTopics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.topicName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.errorWhileSavingData && (
              <p className="w-full text-center text-red-400">
                {errors.errorWhileSavingData}
              </p>
            )}
            {/* Buttons */}
            <div className="flex items-center justify-around sm:justify-end gap-7  w-full">
              <button
                type="button"
                onClick={() => {
                  setIsAddingTopic(false);
                  setSelectedCourse("");
                  setSelectedSubject("");
                  setTopicName("");
                }}
                className="flex items-center justify-center text-lg font-semibold  py-3 px-5 border border-transparent rounded-md shadow-sm text-white bg-red-500 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <X className="mr-2" />
                <span className="text-sm "> Cancel</span>
              </button>
              <button
                type="submit"
                className="flex items-center justify-center text-lg font-semibold  py-3 px-5 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Check className="mr-2" />
                <span className="text-sm "> Save</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
