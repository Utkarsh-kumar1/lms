"use client";
import React, { useState } from "react";
import clsx from "clsx";
import { X, Check, Pencil, Trash2, FilePlus2 } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DeleteCourse } from "@/actions/DeleteCourse";

const CourseCard = ({ course, index, subjectId }) => {
  const [newCourseName, setNewCourseName] = useState(course.courseName);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({
    fileError: "",
    savingError: "",
    deletionError: "",
  });
  const [isSavingData, setIsSavingData] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  const getColor = () => {
    if (course.isCompleted) {
      return "bg-gradient-to-r from-green-200 via-green-300 to-green-400";
    }
    return "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400";
  };

  const handleDeleteClick = async (e) => {
    const { error, success } = await DeleteCourse(course.id);
    if (success) {
      setIsModalOpen(false);
    } else if (error) {
      setErrors((prev) => ({ ...prev, deletionError: error }));
    }
  };

  const handleSaveClick = async () => {
    setIsSavingData(true);
    const reqArray = [];

    if (course.courseName !== newCourseName) {
      const response = axios.patch("/api/updateCourse", {
        newCourseName,
        id: course.id,
      });
      reqArray.push(response);
    }

    if (file) {
      const MAX_FILE_SIZE = 20 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({ ...prev, fileError: "File size exceeds 20MB" }));
        return;
      } else {
        const fileUploadResponse = axios.postForm("/api/uploadfile", {
          file: file,
          courseId: course.id,
          subjectId: subjectId,
        });
        reqArray.push(fileUploadResponse);
      }
    }

    Promise.all(reqArray)
      .then(() => {
        setFile(null);
        router.refresh();
      })
      .catch((err) => {
        console.error(err);
        setErrors((prev) => ({
          ...prev,
          savingError: "Error while saving data. Please try again.",
        }));
        setIsSavingData(false);
      })
      .finally(() => {
        setIsSavingData(false);
        setIsModalOpen(false);
      });
  };

  const handleFileChange = (e) => {
    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    if (e.target.files[0].size < MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, fileError: "" }));
      setFile(e.target.files[0]);
    } else {
      setErrors((prev) => ({ ...prev, fileError: "File size exceeds 20MB" }));
    }
  };

  return (
    <>
      {/* Card Component */}
      <div
        className={clsx(
          "sm:p-6 p-2 mb-4 rounded-lg shadow-lg transition-transform transform hover:scale-[1.01] flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full",
          getColor()
        )}
        onDoubleClick={() => {
          router.push(`/courses/${course.id}`);
        }}
      >
        {index != null ? (
          <p className="text-lg font-semibold text-gray-800">{index + 1}.</p>
        ) : null}

        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col w-full">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              {course.courseName}
            </p>
            <p className="text-sm text-gray-600">
              Status: {course.isCompleted ? "Completed" : "Not Completed"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
            >
              <Pencil className="p-1" />
              <p className="hidden sm:block">Edit</p>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Component */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-700 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Edit Course</h2>
              <button
                onClick={() => {
                  if (!isSavingData) {
                    setIsModalOpen(false);
                    setNewCourseName(course.courseName);
                    setFile(null);
                    setErrors((prev) => ({
                      ...prev,
                      fileError: "",
                      savingError: "",
                    }));
                  }
                }}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <input
              type="text"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              placeholder="Enter new subject name"
            />

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

            {errors.fileError && (
              <p className="text-red-600">{errors.fileError}</p>
            )}
            {errors.savingError && (
              <p className="text-red-600">{errors.savingError}</p>
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                disabled={isSavingData}
              >
                Delete
              </button>
              <button
                onClick={handleSaveClick}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-progress"
                disabled={isSavingData}
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
              the data related to this Course ?{" "}
            </p>
            <div className="flex justify-around mt-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsDeleteModalOpen(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClick}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseCard;
