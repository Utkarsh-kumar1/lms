"use client";
import { DeleteSubTopic } from "@/actions/DeleteSubTopics";
import { DeleteTopic } from "@/actions/DeleteTopic";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BsCheckCircleFill, BsCircle, BsPencilSquare } from "react-icons/bs";
import { IoClose } from "react-icons/io5";

export default function SubtopicCard({
  subtopic,
  subjectId,
  courseId,
  topicId,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newsubtopicName, setnewsubtopicName] = useState(subtopic.subtopicName);
  const [isCompleted, setIsCompleted] = useState(subtopic.isCompleted);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debouncedIsCompleted, setDebouncedIsCompleted] = useState(
    subtopic.isCompleted
  );
  const [errors, setErrors] = useState({
    deletionError: "",
    savingError: "",
    fileError: "",
  });
  const router = useRouter();

  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedIsCompleted !== subtopic.isCompleted) {
        // Perform the network call after the debounce delay
        setIsProcessing(true);
        axios
          .patch("/api/updateSubTopic", {
            id: subtopic.id,
            courseId,
            subjectId,
            topicId,
            isCompleted: debouncedIsCompleted,
          })
          .then(() => {
            router.refresh();
            setIsProcessing(false);
          })
          .catch(() => {
            setIsProcessing(false);
            setIsCompleted(subtopic.isCompleted);
            setDebouncedIsCompleted(subtopic.isCompleted); // Ensure it's updated to original value
          });
      }
    }, 2000); // Debounce delay of 1.5 seconds

    // Cleanup timeout if the component unmounts or value changes before the delay
    return () => {
      clearTimeout(handler);
    };
  }, [
    debouncedIsCompleted,
    courseId,
    subjectId,
    subtopic.id,
    router,
    topicId,
    subtopic.isCompleted,
  ]);

  const toggleCompletionStatus = () => {
    // Toggle the completion status immediately for the UI
    if (!isProcessing) {
      const newStatus = !isCompleted;
      setIsCompleted(newStatus);
      setDebouncedIsCompleted(newStatus); // Set the debounced value for network call
    }
  };

  const handleDeleteClick = async (e) => {
    setIsProcessing(true);
    const { error, success } = await DeleteSubTopic(subtopic.id);
    if (success) {
      setIsDeleteModalOpen(false);
      setIsEditing(false);
      setIsProcessing(false);
    } else if (error) {
      setIsProcessing(false);
      setErrors((prev) => ({ ...prev, deletionError: error }));
    }
  };

  const handleSaveClick = async () => {
    if (
      subtopic.subtopicName !== newsubtopicName ||
      isCompleted !== subtopic.isCompleted
    ) {
      setIsProcessing(true);
      axios
        .patch("/api/updateSubTopic", {
          id: subtopic.id,
          courseId,
          subjectId,
          topicId,
          newsubtopicName: newsubtopicName,
          isCompleted: isCompleted,
        })
        .then(() => {
          setFile(null);
          router.refresh();
          setIsEditing(false);
        })
        .catch((err) => {
          console.error(err);
          setErrors((prev) => ({
            ...prev,
            savingError: "Error while saving data. Please try again.",
          }));
        })
        .finally(() => {
          setIsProcessing(false);
        });
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md shadow-sm mb-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm sm:text-lg font-semibold text-gray-600">
          {subtopic.subTopicIndex}. {subtopic.subtopicName}
        </h4>

        <div className="flex items-center space-x-2">
          {/* Completion Status Toggle */}
          <button
            onClick={toggleCompletionStatus}
            aria-label="Toggle Completion Status"
          >
            {isCompleted ? (
              <BsCheckCircleFill className="text-green-500" size={20} />
            ) : (
              <BsCircle className="text-gray-400" size={20} />
            )}
          </button>
          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(true)}
            className="text-indigo-600 hover:text-indigo-800 transition"
          >
            <BsPencilSquare size={20} />
          </button>
        </div>
      </div>

      {/* Modal for Editing subtopic */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-2">
          <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-lg w-full">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => {
                if (!isProcessing) {
                  setIsEditing(false);
                }
              }}
            >
              <IoClose size={24} />
            </button>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Edit subtopic
            </h3>

            {/* subtopic Name */}
            <div className="mb-4 w-full overflow-hidden">
              <input
                type="text"
                value={newsubtopicName}
                onChange={(e) => setnewsubtopicName(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-wrap h-auto text-sm sm:text-lg"
              />
            </div>

            {/* Mark as Completed */}
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.checked)}
                  className="mr-2"
                />
                Mark as Completed
              </label>
            </div>

            {errors.savingError && (
              <p className="text-red-600 w-full text-center">
                {errors.savingError}
              </p>
            )}

            {/* Save and Cancel Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md disabled:cursor-progress"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isProcessing}
              >
                Delete
              </button>
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md disabled:cursor-progress"
                onClick={handleSaveClick}
                disabled={isProcessing}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-700 bg-opacity-75 z-50 transition-opacity">
          <div className="bg-white p-6 rounded-lg shadow-xl transform transition-all w-full max-w-sm">
            <p className="text-lg font-semibold mb-4">Delete Course </p>
            <p>
              Are you sure you want to delete this Course ? , You will lost all
              the data related to this Course ?
            </p>

            {errors.deletionError && (
              <p className="text-red-600 w-full text-center">
                {errors.deletionError}
              </p>
            )}
            <div className="flex justify-around mt-4">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 disabled:cursor-progress"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClick}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:cursor-progress"
                disabled={isProcessing}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
