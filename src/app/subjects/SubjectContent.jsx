
"use client";
import React, { useState } from "react";
import SubjectCard from "./SubjectCard";
import { Check, X } from "lucide-react";
import { IoAddCircleSharp } from "react-icons/io5";
import { AddNewSubjectAction } from "@/actions/AddNewSubjectAction";
import { useOptimistic } from "react";

export default function SubjectContent({ subjects }) {
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [subjectInput, setSubjectInput] = useState("");
  const [errors, setErrors] = useState({ errorwhileSaving: "" });
  const [optimisticSubject, addOptimisticSubject] = useOptimistic(
    subjects,
    (state, newSubject) => [...state, ...newSubject]
  );

  const handleInputChange = (e) => {
    if (errors.errorwhileSaving) {
      setErrors((prev) => ({ ...prev, errorwhileSaving: "" }));
    }
    setSubjectInput(e.target.value);
    e.target.style.height = "auto"; // Reset height
    e.target.style.height = `${e.target.scrollHeight}px`; // Auto resize based on content
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    const input = subjectInput.trim();
    if (!input) return;

    const subjectNameArray = input.split(";").map((subject) => subject.trim());
    const subjects = subjectNameArray.map((subjectName) => ({
      owner: Math.random(),
      subjectName,
    }));

    addOptimisticSubject(subjects);

    const { error, success } = await AddNewSubjectAction(subjectNameArray);
    if (success) {
      setIsAddingSubject(false);
      setSubjectInput("");
    } else if (error) {
      setErrors((prev) => ({ ...prev, errorwhileSaving: error }));
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-full  h-auto flex flex-col gap-3 dark:bg-gray-700">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Subjects
        </h1>
        <button
          type="button"
          className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 focus:outline-none"
          onClick={() => setIsAddingSubject(true)}
        >
          <IoAddCircleSharp className="h-10 w-10 sm:h-12 sm:w-12" />
        </button>
      </div>

      {/* Subject List */}
      <div className="flex w-full flex-col">
        {optimisticSubject.length > 0 ? (
          optimisticSubject.map((subject, index) => (
            <SubjectCard key={index} subject={subject} />
          ))
        ) : (
          <p className="text-lg text-gray-500 text-center ">
            No subjects found.
          </p>
        )}
      </div>

      {/* Modal for Adding Subject */}
      {isAddingSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
              Add New Subject
            </h2>
            <form onSubmit={handleAddSubject} className="space-y-5">
              <textarea
                autoFocus
                required
                name="subjectName"
                placeholder="Enter subjects (semi-colon separated)"
                value={subjectInput}
                onChange={handleInputChange}
                maxLength={225}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring focus:ring-blue-500 dark:focus:ring-blue-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                rows={2}
              />
              {errors.errorwhileSaving && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.errorwhileSaving}
                </p>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-5 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                  onClick={() => setIsAddingSubject(false)}
                >
                  <X className="h-5 w-5 inline-block mr-1" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                >
                  <Check className="h-5 w-5 inline-block mr-1" />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

