'use client";';

import { useEffect, useState } from "react";
import SubjectItem from "./SubjectItem";
import { IoAddCircleSharp } from "react-icons/io5";
import { Check, X } from "lucide-react";
import api from "@/axios";
import { set } from "zod";
import { useSocket } from "@/context/SocketContext";

export default function CurriculumTree({ data }) {
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [subjectInput, setSubjectInput] = useState("");
  const [errors, setErrors] = useState({ errorwhileSaving: "" });
  const [subjects, setSubjects] = useState(data);

  const socket = useSocket();

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

    // Check for duplicates, empty strings, and whitespace
    const uniqueSubjects = new Set(subjectNameArray);
    const filteredSubjects = Array.from(uniqueSubjects).filter(
      (subject) => subject && subject.trim() !== ""
    );
    if (filteredSubjects.length === 0) {
      setErrors((prev) => ({
        ...prev,
        errorwhileSaving: "Please enter valid subjects.",
      }));
      return;
    }

    try {
      const res = await api.post("addSubjects", {
        subjects: filteredSubjects,
      });
      console.log("Subjects added successfully:", res);

      setSubjects((prev) => [...res.data.data, ...prev]);

      setIsAddingSubject(false); // here
      setSubjectInput("");
    } catch (error) {
      console.error("Error adding subjects:", error);
      if (error.response && error.response.data) {
        setErrors((prev) => ({
          ...prev,
          errorwhileSaving: error.response.data.message,
        }));
      } else {
        setErrors((prev) => ({ ...prev, errorwhileSaving: error }));
      }
    }
  };

  useEffect(() => {
    if (!socket) return;

    // Listen for the 'subjectsUpdated' event
    socket.on("subjectDeleted", (data) => {

      setSubjects((prevSubjects) =>
        prevSubjects.filter((subject) => subject.id !== data.subjectId)
      );
    });
  }, [socket]);

  return (
    <div className="mx-auto bg-white dark:bg-black shadow rounded-lg p-4 ">
      <div className=" fixed top-14 right-4 z-50" title="Add Subject">
        <button
          type="button"
          className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 focus:outline-none"
          onClick={() => setIsAddingSubject(true)}
        >
          <IoAddCircleSharp className="h-10 w-10 sm:h-12 sm:w-12" />
        </button>
      </div>

      {subjects.map((subject) => (
        <SubjectItem key={subject.id} subject={subject} />
      ))}

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
