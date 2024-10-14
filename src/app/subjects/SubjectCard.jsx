"use client";
import React, { useState } from "react";
import clsx from "clsx";
import { X, Pencil, FilePlus2, NotebookPen } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { DeleteSubjectAction } from "@/actions/DeleteSubjectAction";

const SubjectCard = ({ subject }) => {
  const [newSubjectName, setNewSubjectName] = useState(subject.subjectName);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({ fileError: "", savingError: "" });
  const [isSavingData, setIsSavingData] = useState(false);
  const [isFileViewOpen, setIsFileViewOpen] = useState(false);
  const router = useRouter();

  const getColor = () => {
    if (subject.isCompleted)
      return "bg-gradient-to-r from-green-100 to-green-300";

    return "bg-gradient-to-r from-gray-100 to-gray-300";
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const handleSaveClick = async () => {
    setIsSavingData(true);
    const reqArray = [];

    //Updation Subject Name
    if (subject.subjectName != newSubjectName) {
      const EditNameResponse = axios.patch("/api/updateSubject", {
        newSubjectName,
        id: subject.id,
      });
      reqArray.push(EditNameResponse);
    }

    //uploading file
    if (file) {
      const MAX_FILE_SIZE = 1024 * 1024 * 1024; //1 GB
      if (file.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({ ...prev, fileError: "File Size Exceed" }));
      } else {
        const fileUploadResponse = axios.postForm("/api/uploadfile", {
          file: file,
          subjectId: subject.id,
        });
        reqArray.push(fileUploadResponse);
      }
    }

    Promise.all([...reqArray])
      .then(() => {
        router.refresh();
        setIsSavingData(false);

        setIsEditModalOpen(false);
        setFile(null);
      })
      .catch((err) => {
        console.error(err);

        setErrors((prev) => ({
          ...prev,
          savingError: "Error while Saving Data Retry",
        }));
      })
      .finally(() => {
        setIsSavingData(false);
      });
  };

  const handleFileChange = (e) => {
    const MAX_FILE_SIZE = 1024 * 1024 * 1024; //1 GB
    if (e.target.files[0].size < MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, fileError: "" }));
      setFile(e.target.files[0]);
    } else {
      setErrors((prev) => ({ ...prev, fileError: "File Size Exceed" }));
    }
  };

  const handleDeleteClick = async () => {
    const { success, error } = await DeleteSubjectAction(subject.id);
    if (success) {
      setIsModalOpen(false);
      setIsEditModalOpen(false);
    } else if (error) {
      setErrors((prev) => ({ ...prev, savingError: error }));
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div
        className={clsx(
          "p-4 mb-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[101%] flex flex-col sm:flex-row items-center gap-4 justify-between overflow-auto",
          getColor()
        )}
        onDoubleClick={() => {
          router.push(`/subjects/${subject.id}`);
        }}
      >
        <div className="flex w-full flex-col">
          <div className="w-full sm:w-6/12 sm:mr-auto">
            <p className="text-lg font-semibold text-gray-800 text-wrap truncate">
              {subject.subjectName}
            </p>
            <p className="text-sm text-gray-600">
              Status: {subject.isCompleted ? "Completed" : "Not Completed"}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 w-full ">
            {subject?.notes?.length > 0 && (
              <button
                onClick={() => setIsFileViewOpen((prev) => !prev)}
                // onDoubleClick={(e)=>e.stopPropagation()}
                className="flex  items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="View Notes"
              >
                <NotebookPen />
              </button>
            )}
            <button
              onClick={handleEditClick}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Edit subject"
            >
              <Pencil className="m-1" size={20} />
              Edit
            </button>
          </div>
          {/* Notes section */}
          <div
            className={clsx(
              "rounded-md bg-gray-300 p-4 mt-3 transition-max-height duration-700 ease-in-out w-full overflow-hidden",
              isFileViewOpen
                ? " flex max-h-96 opacity-100"
                : " hidden max-h-0 opacity-0"
            )}
          >
            {subject?.notes?.length > 0 && (
              <div className="mt-2 transition-max-height duration-700 ease-in-out w-full ">
                <p className="text-sm font-semibold">Notes:</p>
                <ul className=" text-sm text-gray-700 w-full">
                  {subject.notes.map((note, idx) => (
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
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-700 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Edit Subject</h2>
              <button
                onClick={() => {
                  if (!isSavingData) {
                    setIsEditModalOpen(false);
                    setNewSubjectName(subject.subjectName);
                  }
                }}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
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
                onClick={(e) => setIsModalOpen(true)}
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

      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-700 bg-opacity-75 z-50 transition-opacity">
          <div className="bg-white p-6 rounded-lg shadow-xl transform transition-all w-full max-w-sm">
            <p className="text-lg font-semibold mb-4">Delete Subject</p>
            <p>
              Are you sure you want to delete this subject? , You will lost all
              the data related to this subject?{" "}
            </p>
            <div className="flex justify-around mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
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

export default SubjectCard;
