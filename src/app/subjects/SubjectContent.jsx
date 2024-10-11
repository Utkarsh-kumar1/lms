"use client";
import React, { useState } from "react";
import SubjectCard from "./SubjectCard";
import { Check, Loader, X } from "lucide-react";
import { IoAddCircleSharp } from "react-icons/io5";
import { AddNewSubjectAction } from "@/actions/AddNewSubjectAction";

import { useOptimistic } from "react";  

export default function SubjectContent({ subjects }) {
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [subjectInput, setSubjectInput] = useState("");
  const [errors, setErrors] = useState({ errorwhileSaving: "" });
  const [optimisticSubject, addOptimisticSubject] = useOptimistic(
    subjects,
    (state, newSubject) => {
      return [...state, ...newSubject];
    }
  );

  const handleInputChange = (e) => {
    if (errors.errorwhileSaving) {
      setErrors((prev) => ({ ...prev, errorwhileSaving: "" }));
    }
    setSubjectInput(e.target.value);

    // Auto-resize the textarea based on content
    e.target.style.height = "auto"; // Reset height
    e.target.style.height = `${e.target.scrollHeight}px`; // Set height based on content
  };

  return (
    <>
      <div className="">
        {subjects?.length > 0 ? (
          optimisticSubject.map((subject, index) => (
            <SubjectCard key={index} subject={subject} />
          ))
        ) : (
          <p className="text-lg text-gray-500 text-center">
            No subjects found.
          </p>
        )}
      </div>
     

      {isAddingSubject ? (
        <form
          className="mt-8 space-y-4 flex flex-col items-center"
          action={async (formdata) => {
            const input = formdata.get("subjectName");
            if (!input) {
              return;
            }
            const subjectNameArray = input
              .split(";")
              .map((subject) => subject.trim());

            const subjects = subjectNameArray?.map((subjectName) => {
              return { owner: Math.random(), subjectName, isActive: true };
            });

            addOptimisticSubject(subjects);

            const { error, success } = await AddNewSubjectAction(
              subjectNameArray
            );
            console.log(error, success);
            if (success) {
              setIsAddingSubject(false);
              setSubjectInput("");
              return;
            } else if (error) {
              setErrors((prev) => ({ ...prev, errorwhileSaving: error }));
            }
          }}
        >
          <textarea
            autoFocus
            required
            name="subjectName"
            placeholder="Enter subjects (semi-colon separated)"
            value={subjectInput}
            onChange={handleInputChange}
            maxLength={225}
            className="text-center text-lg font-semibold text-gray-800 border-b border-gray-400 outline-none bg-transparent w-full placeholder:text-gray-500 sm:text-lg sm:placeholder:text-base py-2 resize-none overflow-hidden"
            rows={1}
          />

          {errors.errorwhileSaving && <div>{errors.errorwhileSaving}</div>}

          <div className="flex space-x-4">
            <button
              type="button"
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              onClick={() => setIsAddingSubject(false)}
            >
              <X className="h-5 w-5" />
              <span className="hidden sm:block">Cancel</span>
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Check className="h-5 w-5" />
              <span className="hidden sm:block">Save</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-8 w-full flex items-center justify-center">
          <button
            type="button"
            className="text-green-600 hover:text-green-700 focus:outline-none"
            onClick={() => setIsAddingSubject(true)}
          >
            <IoAddCircleSharp className="h-12 w-12 sm:h-14 sm:w-14" />
          </button>
        </div>
      )}
    </>
  );
}
