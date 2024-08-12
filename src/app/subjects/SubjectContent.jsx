"use client";
import React, { useState, useEffect } from "react";
import SubjectCard from "./SubjectCard";
import { IoAddCircleSharp } from "react-icons/io5";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddSubjectForm from "./AddSubjectForm";

export default function SubjectContent({ subjects: initialSubjects }) {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [isActive, setIsActive] = useState(true);
  const [isCompleted, setIsCompleted] = useState(true);
  const [isAddingSubject, setIsAddingSubject] = useState(false);

  useEffect(() => {
    setSubjects(initialSubjects);
  }, [initialSubjects]);

  const filteredSubjects = subjects.filter((subject) => {
    if (isActive && isCompleted) {
      return true;
    } else if (isCompleted) {
      return subject.isCompleted;
    } else if (isActive) {
      return subject.isActive;
    } else {
      return false;
    }
  });

  function onSubjectAdded(subject) {
    setSubjects((prevSubjects) => [...prevSubjects, ...subject]);
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen flex flex-col gap-3">
      <div className="">
        <h1 className="text-2xl font-bold text-gray-800">Subjects</h1>
        <div className="flex space-x-4 mt-4">
          <Select
            defaultValue="All"
            onValueChange={(data) => {
              if (data === "isCompleted") {
                setIsCompleted(true);
                setIsActive(false);
              } else if (data === "isActive") {
                setIsActive(true);
                setIsCompleted(false);
              } else if (data === "All") {
                setIsCompleted(true);
                setIsActive(true);
              }
            }}
          >
            <SelectTrigger className="w-[180px] bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="isActive">Active</SelectItem>
              <SelectItem value="isCompleted">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="">
        {filteredSubjects.length > 0 ? (
          filteredSubjects.map((subject, index) => (
            <SubjectCard key={subject.id} index={index} subject={subject} />
          ))
        ) : (
          <p className="text-lg text-gray-500">
            No subjects match the current filters.
          </p>
        )}
      </div>
      <div className="flex items-center w-full justify-center min-h-14 flex-col">
        {isAddingSubject ? (
          <AddSubjectForm
            setIsAddingSubject={setIsAddingSubject}
            onSubjectAdded={onSubjectAdded}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setIsAddingSubject(true);
            }}
          >
            <IoAddCircleSharp className="size-9 sm:h-14 sm:w-14" />
          </button>
        )}
      </div>
    </div>
  );
}
