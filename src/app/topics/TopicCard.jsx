"use client"
import { DeleteTopic } from "@/actions/DeleteTopic";
import axios from "axios";
import clsx from "clsx";
import { FilePlus2, NotebookPen } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BsCheckCircleFill, BsCircle, BsPencilSquare } from "react-icons/bs";
import { IoClose } from "react-icons/io5";

export default function TopicCard({ topic, subjectId, courseId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newtopicName, setnewtopicName] = useState(topic.topicName);
  const [isCompleted, setIsCompleted] = useState(topic.isCompleted);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFileViewOpen, setIsFileViewOpen] = useState(false);
  const [debouncedIsCompleted, setDebouncedIsCompleted] = useState(
    topic.isCompleted
  );
  const [errors, setErrors] = useState({
    deletionError: "",
    savingError: "",
    fileError: "",
  });
  const router = useRouter();

  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedIsCompleted !== topic.isCompleted) {
        // Perform the network call after the debounce delay
        setIsProcessing(true)
        axios
          .patch("/api/updateTopic", {
            id: topic.id,
            courseId,
            subjectId,
            isCompleted: debouncedIsCompleted,
          })
          .then(() => {
            router.refresh();
            setIsProcessing(false)
          })
          .catch((err) => {
            console.error(err);
            // setErrors((prev) => ({
            //   ...prev,
            //   savingError: "Error while saving completion status.",
            // }));
            setIsProcessing(false)
          });
      }
    }, 2000); // Debounce delay of 1.5 seconds

    // Cleanup timeout if the component unmounts or value changes before the delay
    return () => {
      clearTimeout(handler);
    };
  }, [debouncedIsCompleted, courseId, subjectId, topic.id, router , topic.isCompleted]);

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
    const { error, success } = await DeleteTopic(topic.id);
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
    setIsProcessing(true);
    const reqArray = [];

    if (topic.topicName !== newtopicName || isCompleted !== topic.isCompleted) {
      const response = axios.patch("/api/updateTopic", {
        id: topic.id,
        courseId,
        subjectId,
        newtopicName,
        isCompleted,
      });
      reqArray.push(response);
    }

    if (file) {
      const MAX_FILE_SIZE = 1024 * 1024 * 1024; //1GB
      if (file.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({
          ...prev,
          fileError: "File size exceeds 1GB",
        }));
        return;
      } else {
        const fileUploadResponse = axios.postForm("/api/uploadfile", {
          file: file,
          courseId: courseId,
          subjectId: subjectId,
          topicId: topic.id,
        });
        reqArray.push(fileUploadResponse);
      }
    }

    Promise.all(reqArray)
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
  };

  const handleFileChange = (e) => {
    const MAX_FILE_SIZE = 1024 * 1024 * 1024;
    if (e.target.files[0].size < MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, fileError: "" }));
      setFile(e.target.files[0]);
    } else {
      setErrors((prev) => ({ ...prev, fileError: "File size exceeds 1GB" }));
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md shadow-sm mb-4"
    onDoubleClick={()=>router.push(`/topics/${topic.id}`)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm sm:text-lg font-semibold text-gray-700">
          {topic.topicIndex}. {topic.topicName}
        </h4>

        <div className="flex items-center space-x-2">
          {topic?.notes?.length > 0 && (
            <button
              onClick={() => setIsFileViewOpen((prev) => !prev)}
              aria-label="View Notes"
            >
              <NotebookPen />
            </button>
          )}
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

      <div
        className={clsx(
          "rounded-md bg-gray-300 p-4 mt-3 transition-max-height duration-700 ease-in-out w-full overflow-hidden",
          isFileViewOpen
            ? " flex max-h-96 opacity-100"
            : " hidden max-h-0 opacity-0"
        )}
      >
        {topic?.notes?.length > 0 && (
          <div className="mt-2 transition-max-height duration-700 ease-in-out w-full ">
            <p className="text-sm font-semibold">Notes:</p>
            <ul className=" text-sm text-gray-700 w-full">
              {topic.notes.map((note, idx) => (
                <li
                  key={idx}
                  className="max-w-full truncate"
                  title={note.fileName}
                >
                  <a
                    href={`api/files/${note.filePath}`}
                    target="_blank"
                    className="text-blue-600 underline"
                    rel="noopener noreferrer"
                  >
                    {note.fileName}
                  </a>
                  <p className="flex flex-col w-full text-wrap ml-3">
                    <span className="font-bold"> Uploaded At : </span>
                    {new Date(note.createdAt)
                      .toString()
                      .replace("GMT+0530 (India Standard Time)", "")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Modal for Editing Topic */}
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
              Edit Topic
            </h3>

            {/* Topic Name */}
            <div className="mb-4">
              <label className="block text-gray-600 mb-1">Topic Name</label>
              <input
                type="text"
                value={newtopicName}
                onChange={(e) => setnewtopicName(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            {/* File Upload */}
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2">
                <FilePlus2 size={20} />
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span>Upload File</span>
              </label>
              {file && (
                <p
                  className="text-sm text-gray-500 max-w-[12rem] sm:w-fit overflow-hidden truncate"
                  title={file.name}
                >
                  {file.name}
                </p>
              )}
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

            {errors.fileError && (
              <p className="text-red-600 w-full text-center">
                {errors.fileError}
              </p>
            )}
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
