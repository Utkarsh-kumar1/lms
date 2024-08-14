"use client";
import React, { useState } from "react";
import SubjectCard from "../SubjectCard";
import CourseCard from "@/app/courses/CourseCard";
import { IoAddCircleSharp } from "react-icons/io5";
import AddCourseForm from "@/app/courses/AddCourseForm";

export default function Subject({ subjects , courses :initialCourses }) {
  const [courses, setCourses] = useState(initialCourses)

  const [isAddingCourse, setisAddingCourse] = useState(false);

  function onCourseAdded(Addedcourses) {
    setCourses((prev) => [...prev, ...Addedcourses]);
  }
  return (
    <>
      <SubjectCard subject={subjects[0]} />
      {courses.length === 0 ? (
        <div>No Courses Found</div>
      ) : (
        courses.map((course, index) => (
          <CourseCard course={course} index={index} key={index} />
        ))
      )}
      {/* <AddSubject courses={courses} /> */}
      <div className="flex items-center w-full justify-center min-h-14 flex-col">
        {isAddingCourse ? (
          <AddCourseForm
            subjectId={subjects[0].id}
            setIsCourseAdding={setisAddingCourse}
            onCourseAdded={onCourseAdded}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setisAddingCourse(true);
            }}
          >
            <IoAddCircleSharp className=" size-9 sm:h-14 sm:w-14" />
          </button>
        )}
      </div>
    </>
  );
}
