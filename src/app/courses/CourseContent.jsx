"use client";
import React, { useState, useEffect } from "react";
import CourseCard from "./CourseCard";
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
import AddCourseForm from "./AddCourseForm";

export default function CourseContent({ courses: initialCourses }) {
  const [courses, setCourses] = useState(initialCourses);
  const [isCompleted, setIsCompleted] = useState(true);
  const [isAll, setIsAll] = useState(true);
  const [filtedSubject, setfiltedSubject] = useState([]);
  const [isAddingSubject, setIsCourseAdded] = useState(false);

  // useEffect(() => {
  //   setCourses(initialCourses);
  // }, [initialCourses]);

  const filteredCourses = courses?.filter(
      (course) =>
        filtedSubject.length === 0 || filtedSubject.includes(course.subjectName)
    )
    .filter((course) =>
      isAll ? true : isCompleted ? course.isCompleted : !course.isCompleted
    );

  const subjects = Array.from(
    new Set(courses?.map((course) => course.subjectName))
  );

  function onCourseAdded(Addedcourses) {
    setCourses((prevCourses) => [...prevCourses, ...Addedcourses]);
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Courses</h1>
        <div className="flex mt-4 rounded-md border-2 gap-2 md:gap-6 p-4 sm:items-center flex-col sm:flex-row items-start justify-start">
          <p>Filter :</p>
          <MultiSelect
            onChange={(value) => {
              setfiltedSubject(value);
            }}
          >
            <MultiSelectTrigger className="w-[180px]">
              <MultiSelectValue placeholder="All Subject" />
            </MultiSelectTrigger>
            <MultiSelectContent>
              {subjects.map((subject, index) => (
                <MultiSelectItem key={index} value={subject}>
                  {subject}
                </MultiSelectItem>
              ))}
            </MultiSelectContent>
          </MultiSelect>
          <Select
            defaultValue="Status(Any)"
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
              <SelectItem value="Status(Any)">Status(Any)</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="UnCompleted">Not Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-4">
        {filteredCourses.length > 0 ? (
          filteredCourses?.map((course, index) => (
            <CourseCard key={course.id} index={index} course={course} />
          ))
        ) : (
          <p className="text-lg text-gray-500">
            No courses Found.
          </p>
        )}
      </div>
      <div className="flex items-center w-full justify-center min-h-28 flex-col">
        {isAddingSubject ? (
          <AddCourseForm
            setIsCourseAdding={setIsCourseAdded}
            onCourseAdded={onCourseAdded}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setIsCourseAdded(true);
            }}
          >
            <IoAddCircleSharp className="size-9 sm:h-14 sm:w-14" />
          </button>
        )}
      </div>
    </div>
  );
}
