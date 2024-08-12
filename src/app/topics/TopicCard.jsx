"use client";
import React, { useState } from "react";
import clsx from "clsx";
import { X, Check, Pencil } from "lucide-react";

import axios from "axios";
import { useRouter } from "next/navigation";

const TopicCard = ({ topic, index }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newtopicName, setnewtopicName] = useState(topic.topicName);
  const router = useRouter()

  const getColor = () => {
    if (topic.isCompleted) return "bg-green-100"; // Completed
    return "bg-gray-200"; // Active but not completed
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    const response = await axios.patch("/api/updateTopic", {
      newtopicName,
      id: topic.id,
    });

    if (response.status == 200) {
      topic.topicName = newtopicName;
    }
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setnewtopicName(topic.topicName);
    setIsEditing(false);
  };

  return (
    <div
      className={clsx(
        "sm:p-6 p-2 mb-4 rounded-lg shadow-lg transition-transform transform hover:scale-[1.01] flex items-center gap-2 sm:gap-3",
        getColor()
      )}
      onDoubleClick={() => {
        router.push(`/topics/${topic.id}`);
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
              value={newtopicName}
              onChange={(e) => setnewtopicName(e.target.value)}
              className="text-lg font-semibold text-gray-800 border-b border-gray-400 outline-none bg-transparent w-3/4  sm:w-80 md:w-96 "
            />
          ) : (
            <p className=" text-sm sm:text-lg font-semibold text-gray-800">
              {topic.topicName}
            </p>
          )}
          {topic.isCompleted ? (
            <p className="text-sm text-gray-600">Status: Completed</p>
          ) : (
            <p className="text-sm text-gray-600">Status: UnCompleted</p>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicCard;
