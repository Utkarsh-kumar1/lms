"use client";

import api from "@/axios";
import { useState } from "react";
import { BsCheckCircleFill, BsCircle, BsPencilSquare } from "react-icons/bs";
import { IoClose } from "react-icons/io5";

export default function SubTopicItem({ subtopic, handleSubTopicDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newsubtopicName, setnewsubtopicName] = useState(subtopic.subtopicName);
  const [isCompleted, setIsCompleted] = useState(subtopic.isCompleted);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({
    deletionError: "",
    savingError: "",
    fileError: "",
  });

  // TODO: Check these fuctions

  //     useEffect(() => {
  //     const handler = setTimeout(() => {
  //       if (debouncedIsCompleted !== subtopic.isCompleted) {
  //         // Perform the network call after the debounce delay
  //         setIsProcessing(true);
  //         axios
  //           .patch("/api/updateSubTopic", {
  //             id: subtopic.id,
  //             courseId,
  //             subjectId,
  //             topicId,
  //             isCompleted: debouncedIsCompleted,
  //           })
  //           .then(() => {
  //             router.refresh();
  //             setIsProcessing(false);
  //           })
  //           .catch(() => {
  //             setIsProcessing(false);
  //             setIsCompleted(subtopic.isCompleted);
  //             setDebouncedIsCompleted(subtopic.isCompleted); // Ensure it's updated to original value
  //           });
  //       }
  //     }, 1); // Debounce delay of 1.5 seconds

  //     // Cleanup timeout if the component unmounts or value changes before the delay
  //     return () => {
  //       clearTimeout(handler);
  //     };
  //   }, [
  //     debouncedIsCompleted,
  //     courseId,
  //     subjectId,
  //     subtopic.id,
  //     router,
  //     topicId,
  //     subtopic.isCompleted,
  //   ]);

  const toggleCompletionStatus = () => {
    // Toggle the completion status immediately for the UI
    // if (!isProcessing) {
    //   const newStatus = !isCompleted;
    //   setIsCompleted(newStatus);
    //   setDebouncedIsCompleted(newStatus); // Set the debounced value for network call
    // }
  };

  

  const handleSaveClick = async () => {
    if (
      subtopic.subtopicName !== newsubtopicName ||
      isCompleted !== subtopic.isCompleted
    ) {
      try {
        setIsProcessing(true);
        const res = await api.patch("updateSubTopic", {
          subTopicId: subtopic.id,
          topicId: subtopic.topic,
          subTopicName: newsubtopicName,
          isCompleted: isCompleted,
        });
        subtopic.subtopicName = newsubtopicName;
        subtopic.isCompleted = isCompleted;
        setIsEditing(false);
      } catch (err) {
        console.error("Error while saving data:", err);
        setErrors((prev) => ({
          ...prev,
          savingError: "Error while saving data. Please try again.",
        }));
      } finally {
        setIsProcessing(false);
      }

      // axios
      //   .patch("/api/updateSubTopic", {
      //     id: subtopic.id,
      //     courseId,
      //     subjectId,
      //     topicId,
      //     newsubtopicName: newsubtopicName,
      //     isCompleted: isCompleted,
      //   })
      //   .then(() => {
      //     setFile(null);
      //     router.refresh();
      //     setIsEditing(false);
      //   })
      //   .catch((err) => {
      //     setErrors((prev) => ({
      //       ...prev,
      //       savingError: "Error while saving data. Please try again.",
      //     }));
      //   })
      //   .finally(() => {
      //     setIsProcessing(false);
      //   });
      
      
    }
  };
  return (
    <div className="ml-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-md shadow-sm mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isCompleted ? (
            <BsCheckCircleFill className="text-green-500" size={20} />
          ) : (
            <BsCircle className="text-gray-400 dark:text-gray-500" size={20} />
          )}
          <h4 className="text-sm sm:text-lg font-semibold text-gray-600 dark:text-gray-200">
            {subtopic.subTopicIndex}. {subtopic.subtopicName}
          </h4>
        </div>

        <div className="flex items-center space-x-2">
          {/* Completion Status Toggle */}
          <button aria-label="Toggle Completion Status"></button>
          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(true)}
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-500 transition"
          >
            <BsPencilSquare size={20} />
          </button>
        </div>
      </div>

      {/* Modal for Editing subtopic */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative max-w-lg w-full">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => {
                if (!isProcessing) {
                  setIsEditing(false);
                }
              }}
            >
              <IoClose size={24} />
            </button>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Edit subtopic
            </h3>

            {/* subtopic Name */}
            <div className="mb-4 w-full overflow-hidden">
              <input
                type="text"
                value={newsubtopicName}
                onChange={(e) => setnewsubtopicName(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-md p-2 text-wrap h-auto text-sm sm:text-lg"
              />
            </div>

            {/* Mark as Completed */}
            <div className="mb-4">
              <label className="inline-flex items-center text-gray-600 dark:text-gray-300">
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
              <p className="text-red-600 dark:text-red-400 w-full text-center">
                {errors.savingError}
              </p>
            )}

            {/* Save and Cancel Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 px-4 py-2 rounded-md disabled:cursor-progress text-white"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isProcessing}
              >
                Delete
              </button>
              <button
                className="bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-800 text-white px-4 py-2 rounded-md disabled:cursor-progress"
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
        <div className="fixed inset-0 flex justify-center items-center bg-gray-700 dark:bg-gray-900 bg-opacity-75 z-50 transition-opacity">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl transform transition-all w-full max-w-sm">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Delete Course
            </p>
            <p className="text-gray-700 dark:text-gray-400">
              Are you sure you want to delete this Course? You will lose all
              data related to this Course.
            </p>

            {errors.deletionError && (
              <p className="text-red-600 dark:text-red-400 w-full text-center">
                {errors.deletionError}
              </p>
            )}
            <div className="flex justify-around mt-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition duration-200 disabled:cursor-progress"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubTopicDelete(subtopic?.id)}
                className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition duration-200 disabled:cursor-progress"
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
