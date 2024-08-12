"use client";
import React, { useState } from "react";
import clsx from "clsx";
import { X, Check, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";


import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

const SubjectCard = ({ subject, index }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState(subject.subjectName);
  const [isActive, setIsActive] = useState(subject.isActive);
  const router = useRouter();

  const getColor = () => {
    if (!isActive) return "bg-gray-200"; // Inactive
    if (subject.isCompleted) return "bg-green-100"; // Completed
    return "bg-yellow-100"; // Active but not completed
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    const response = await axios.patch("/api/updateSubject", {
      newSubjectName,
      id: subject.id,
    });

    if (response.status == 200) {
      subject.subjectName = newSubjectName;
    }
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setNewSubjectName(subject.subjectName);
    setIsEditing(false);
  };

  return (
    <div
      className={clsx(
        "sm:p-6 p-2 mb-4 rounded-lg shadow-lg transition-transform transform hover:scale-[1.01] flex items-center gap-2 sm:gap-3",
        getColor()
      )}
      onDoubleClick={() => {
        router.push(`/subjects/${subject.id}`);
      }}
    >
      {index != null ? (
        <p className="text-lg font-semibold text-gray-800">{index + 1}.</p>
      ) : null}
      <div className="flex items-center justify-between w-full">
        <div>
          {isEditing ? (
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              className="text-lg font-semibold text-gray-800 border-b border-gray-400 outline-none bg-transparent w-52 "
            />
          ) : (
            <p className=" text-sm sm:text-lg font-semibold text-gray-800">
              {subject.subjectName}
            </p>
          )}
          {subject.isCompleted ? (
            <p className="text-sm text-gray-600">Status: Completed</p>
          ) : (
            <p className="text-sm text-gray-600">Status: Uncompleted</p>
          )}
          {isActive ? (
            <p className="text-sm text-gray-600">Status: Active</p>
          ) : (
            <p className="text-sm text-gray-600">Status: Inactive</p>
          )}
        </div>
        <div className="flex items-center">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveClick}
                className="flex items-center sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 mr-2"
              >
                <Check />
                <p className=" hidden  sm:block">Save</p>
              </button>
              <button
                onClick={handleCancelClick}
                className="flex items-center sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <X />
                <p className=" hidden  sm:block">Cancel</p>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
              >
                <Pencil className=" p-1" />
                <p className="hidden sm:block">Edit</p>
              </button>
              <Select
                onValueChange={async (data) => {
                  if (data === "Activate" && isActive == false) {
                    const response = await axios.patch("/api/updateSubject", {
                      isActive: !isActive,
                      id: subject.id,
                    });

                    if (response.status == 200) {
                      subject.isActive = true;
                      setIsActive(true);
                    }
                  } else if (data === "Deactivate" && isActive == true) {
                    const response = await axios.patch("/api/updateSubject", {
                      isActive: !isActive,
                      id: subject.id,
                    });
                    if (response.status == 200) {
                      subject.isActive = false;
                      setIsActive(false);
                    }
                  }
                }}
              >
                <SelectTrigger className="sm:w-[8rem] bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activate">Activate</SelectItem>
                  <SelectItem value="Deactivate">Deactivate</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectCard;
