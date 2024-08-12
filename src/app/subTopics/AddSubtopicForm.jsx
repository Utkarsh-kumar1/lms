
"use client";
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { X, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

async function fetchData(url) {
  try {
    const response = await axios.get(url);
    return response.data.data;
  } catch (error) {
    throw new Error(`Error while fetching data from ${url}`);
  }
}

const AddSubtopicForm = ({
  setIsSubTopicAdding,
  onSubtopicAdded,
  subjectId,
  courseId,
  topicId,
}) => {
  const [subtopicName, setSubtopicName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(subjectId || null);
  const [selectedCourse, setSelectedCourse] = useState(courseId || null);
  const [selectedTopic, setSelectedTopic] = useState(topicId || null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({
    subtopicName: "",
    subject: "",
    course: "",
    topic: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const subjectsData = subjectId ? [] : await fetchData("/api/subject");
        const coursesData = await fetchData("/api/course");
        const topicsData = await fetchData("/api/topic");
        setSubjects(subjectsData);
        setCourses(coursesData);
        setTopics(topicsData);
      } catch (error) {
        setErrors({ ...errors, fetch: error.message });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [subjectId]);

  useEffect(() => {
    setFilteredCourses(
      courses.filter((course) => course.subjectId === selectedSubject)
    );
  }, [selectedSubject, courses]);

  useEffect(() => {
    setFilteredTopics(
      topics.filter((topic) => topic.courseId === selectedCourse)
    );
  }, [selectedCourse, topics]);

  const validateForm = () => {
    const newErrors = { subtopicName: "", subject: "", course: "", topic: "" };
    if (!subtopicName) newErrors.subtopicName = "Subtopic Name is required.";
    if (!selectedSubject) newErrors.subject = "Subject is required.";
    if (!selectedCourse) newErrors.course = "Course is required.";
    if (!selectedTopic) newErrors.topic = "Topic is required.";
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSaveClick = async () => {
    if (!validateForm()) return;

    setErrors({ subtopicName: "", subject: "", course: "", topic: "" });

    try {
      const subtopicsArray = subtopicName
        .split(",")
        .map((subtopic) => subtopic.trim());

      const response = await axios.post("/api/updateSubTopic", {
        subtopics: subtopicsArray,
        subjectId: selectedSubject,
        courseId: selectedCourse,
        topicId: selectedTopic,
      });

      if (response.status === 200) {
        if (response.data.data == null) {
          setErrors({ ...errors, subtopicName: "All subtopics already exist" });
          return;
        }
        console.log(response.data.data);
        
        onSubtopicAdded(response.data.data);
        setIsSubTopicAdding(false);
      }
    } catch (error) {
      setErrors({ ...errors, fetch: "Error while saving the subtopic." });
    }
  };

  const handleCancelClick = () => {
    setIsSubTopicAdding(false);
  };

  if (loading) return <div>Loading...</div>;
  if (errors.fetch) return <div>{errors.fetch}</div>;

  return (
    <div className="md:p-6 p-6 mb-4 rounded-lg shadow-lg flex flex-col gap-4 items-center w-full">
      <div className="flex flex-col sm:flex-row gap-4 items-center w-full ">
        <div className="relative w-full min-w-[265px] ">
          <input
            type="text"
            autoFocus
            value={subtopicName}
            placeholder="Subtopic Names (comma separated)"
            onChange={(e) => setSubtopicName(e.target.value)}
            className="text-lg font-semibold text-gray-800 border-b border-gray-400 outline-none bg-transparent w-full text-center p-2 placeholder:text-sm "
            required
          />
          {errors.subtopicName && (
            <p className="text-red-500 text-sm mt-1">{errors.subtopicName}</p>
          )}
        </div>

        {!subjectId && (
          <div className="relative w-full sm:w-fit lg:w-[170px]  ">
            <Select
              onValueChange={(value) => setSelectedSubject(value)}
              onOpenChange={(open) => setIsDropdownOpen(open)}
            >
              <SelectTrigger className="w-full sm:w-fit lg:w-[170px] bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent className="z-50">
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
            )}
          </div>
        )}

        {!courseId && (
          <div className="relative w-full sm:w-fit lg:w-[170px] ">
            <Select
              open={isCourseDropdownOpen}
              onValueChange={(value) => {
                setSelectedCourse(value);
                if (errors.course) {
                  setErrors({ ...errors, course: "" });
                }
              }}
              onOpenChange={(open) => {
                if (!selectedSubject) {
                  setErrors({ ...errors, course: "First select the subject" });
                  return;
                }
                setIsCourseDropdownOpen(open);
              }}
            >
              <SelectTrigger className="w-full sm:w-fit lg:w-[170px]  bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent className="z-50">
                {filteredCourses.length === 0 ? (
                  <div className="text-red-500 p-2">No Courses found</div>
                ) : (
                  filteredCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.courseName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.course && (
              <p className="text-red-500 text-sm mt-1">{errors.course}</p>
            )}
          </div>
        )}

        {!topicId && (
          <div className="relative w-full sm:w-fit lg:w-[170px] ">
            <Select
              open={isTopicDropdownOpen}
              onValueChange={(value) => {
                setSelectedTopic(value);
                if (errors.topic) {
                  setErrors({ ...errors, topic: "" });
                }
              }}
              onOpenChange={(open) => {
                if (!selectedCourse) {
                  setErrors({ ...errors, topic: "First select the Course" });
                  return;
                }
                setIsTopicDropdownOpen(open);
              }}
            >
              <SelectTrigger className="w-full sm:w-fit lg:w-[170px]  bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <SelectValue placeholder="Select Topic" />
              </SelectTrigger>
              <SelectContent className="z-50">
                {filteredTopics.length === 0 ? (
                  <div className="text-red-500 p-2">No topics found</div>
                ) : (
                  filteredTopics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.topicName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.topic && (
              <p className="text-red-500 text-sm mt-1">{errors.topic}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-around sm:justify-end gap-7  w-full ">
        <button
          onClick={handleSaveClick}
          className={clsx(
            "flex items-center justify-center text-lg font-semibold  py-3 px-5 border border-transparent rounded-md shadow-sm text-white",
            !subtopicName ||
              !selectedSubject ||
              !selectedCourse ||
              !selectedTopic
              ? "bg-gray-400"
              : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          )}
          disabled={
            !subtopicName ||
            !selectedSubject ||
            !selectedCourse ||
            !selectedTopic
          }
        >
          <Check className="mr-2" />
          <span>Save</span>
        </button>
        <button
          onClick={handleCancelClick}
          className="flex items-center justify-center text-lg font-semibold  py-3 px-5 border border-transparent rounded-md shadow-sm text-white bg-red-500 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <X className="mr-2" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddSubtopicForm;

