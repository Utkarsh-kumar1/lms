"use client";
import React, { startTransition, useState } from "react";
import CourseCard from "./CourseCard";
import { IoAddCircleSharp } from "react-icons/io5";
import { Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddCourse } from "@/actions/AddCourse";
import { useOptimistic } from "react";

export default function CourseContent({ subjects }) {
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [errors, setErrors] = useState({ errorWhileSavingData: "" });

  // Use optimistic state for subjects
  const [optimisticSubjects, addOptimisticSubjects] = useOptimistic(
    subjects,
    (state, newCourses) => {
      // Update the optimistic state with the new courses
      return state.map((subject) =>
        subject.id === newCourses.subjectId
          ? { ...subject, courses: [...subject.courses, ...newCourses.courses] }
          : subject
      );
    }
  );

  // Function to handle the addition of new courses
  async function handleAddCourse(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const subjectId = formData.get("SubjectId");
    const courseNames = formData
      .get("CourseName")
      .split(";")
      .map((name) => name.trim())
      .filter((name) => name);

    if (!subjectId || courseNames.length === 0) {
      setErrors((prev) => ({
        ...prev,
        errorWhileSavingData: "Please provide both subject and course names.",
      }));
      return;
    }

    try {
      // Optimistically add the new courses to the state
      startTransition(() => {
        addOptimisticSubjects({
          subjectId,
          courses: courseNames.map((courseName) => ({
            id: Math.random().toString(36), // Temporary ID for optimistic UI
            courseName,
            isCompleted: false,
          })),
        });
      });

      // Perform the actual server request
      const { error, success } = await AddCourse(subjectId, courseNames);
      if (error) {
        setErrors((prev) => ({ ...prev, errorWhileSavingData: error }));
      }
      if (success) {
        setIsAddingCourse(false);
        setErrors((prev) => ({ ...prev, errorWhileSavingData: "" }));
      }
    } catch (err) {
      console.log(err);
      
      setErrors((prev) => ({
        ...prev,
        errorWhileSavingData: "Error while saving data.",
      }));
    }
  }

  // Filter subjects to only show those with courses
  const subjectsWithCourses = optimisticSubjects.filter(
    (subject) => subject.courses.length > 0
  );

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
        <button
          className="text-blue-500 hover:text-blue-700 transition"
          onClick={() => setIsAddingCourse(true)}
        >
          <IoAddCircleSharp className="h-10 w-10" />
        </button>
      </div>

      {/* Subject and Course Listing */}
      <div className="mt-3">
        {subjectsWithCourses.length > 0 ? (
          subjectsWithCourses.map((subject) => (
            <div key={subject.id} className="space-y-4">
              {/* Subject Header */}
              <div className="border-b pb-3">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {subject.subjectName}
                </h2>
              </div>

              {/* Courses within the subject */}
              <div className="flex w-full items-center flex-col">
                {subject.courses.map((course) => (
                  <CourseCard key={course.id} course={course}  subjectId={subject.id}/>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-lg text-gray-500">
            No subjects with courses found.
          </p>
        )}
      </div>

      {/* Add Course Form Modal */}
      {isAddingCourse && (
        <form
          onSubmit={handleAddCourse}
          className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Add a New Course</h2>
            <div className="sm:p-6 p-4 mb-4 rounded-lg shadow-lg transition-transform transform flex flex-col gap-4 items-center w-full max-w-lg mx-auto bg-white">
              <div className="flex flex-col gap-4 items-center w-full">
                {/* Input for Course Names */}
                <div className="relative w-full">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Course Names (semi-colon separated)"
                    className="text-lg font-semibold text-gray-800 border-b border-gray-400 outline-none bg-transparent w-full text-center sm:text-left p-2 placeholder:text-sm sm:placeholder:text-lg"
                    required
                    name="CourseName"
                  />
                </div>

                {/* Dropdown for Subjects */}
                <div className="w-full">
                  <Select name="SubjectId" required>
                    <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
                </div>
              </div>
            </div>
            {errors.errorWhileSavingData && (
              <p className="w-full text-center text-red-400">
                {errors.errorWhileSavingData}
              </p>
            )}
            {/* Save and Cancel Buttons */}
            <div className="flex items-center justify-around w-full">
              <button
                className="mt-4 text-red-500 hover:text-red-700 transition"
                onClick={() => {
                  setIsAddingCourse(false);
                  setErrors((prev) => ({
                    ...prev,
                    errorWhileSavingData: "",
                  }));
                }}
              >
                Cancel
              </button>
              <button
                className="mt-4 text-green-500 hover:text-green-700 transition"
                type="submit"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
