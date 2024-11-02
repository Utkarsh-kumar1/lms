"use client";
import { IoClose } from "react-icons/io5";
import { FilePlus2 } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState } from "react";

export default function FileUploadModal({
  isOpen,
  setIsOpen,
  courseId,
  subjectId,
  topicId,
}) {
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({ savingError: "", fileError: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleSaveClick = async () => {
    setIsProcessing(true);
    if (file) {
      const MAX_FILE_SIZE = 1024 * 1024 * 1024; //1GB
      if (file.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({
          ...prev,
          fileError: "File size exceeds 1GB",
        }));
        return;
      } else {
        axios
          .postForm("/api/uploadfile", {
            file: file,
            courseId,
            subjectId,
            topicId,
          })
          .then(() => {
            setFile(null);
            router.refresh();
            setIsOpen(false);
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
    }
  };

  const handleFileChange = (e) => {
    const MAX_FILE_SIZE = 1024 * 1024 * 1024; //1GB
    if (e.target.files[0].size < MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, fileError: "" }));
      setFile(e.target.files[0]);
    } else {
      setErrors((prev) => ({ ...prev, fileError: "File size exceeds 1GB" }));
    }
  };

  if (isOpen)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-2 dark:bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-lg w-full dark:bg-gray-800">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => {
              if (!isProcessing) {
                setIsOpen(false);
              }
            }}
          >
            <IoClose size={24} />
          </button>

          <h3 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-100">
            Upload File
          </h3>

          {/* File Upload */}
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
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
                className="text-sm text-gray-500 max-w-[12rem] sm:w-fit overflow-hidden truncate dark:text-gray-400"
                title={file.name}
              >
                {file.name}
              </p>
            )}
          </div>

          {errors.fileError && (
            <p className="text-red-600 w-full text-center dark:text-red-400">
              {errors.fileError}
            </p>
          )}
          {errors.savingError && (
            <p className="text-red-600 w-full text-center dark:text-red-400">
              {errors.savingError}
            </p>
          )}

          {/* Save and Cancel Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md disabled:cursor-progress dark:bg-red-600 dark:hover:bg-red-700"
              onClick={() => setIsOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md disabled:cursor-progress dark:bg-indigo-500 dark:hover:bg-indigo-600"
              onClick={handleSaveClick}
              disabled={isProcessing}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
}
