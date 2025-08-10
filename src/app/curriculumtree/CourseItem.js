import { useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Minus, Plus } from "lucide-react";
import TopicItem from "./TopicItem";
import api from "@/axios";
import clsx from "clsx";
import { X, Pencil, FilePlus2, NotebookPen } from "lucide-react";
import { BsCheckCircleFill, BsCircle } from "react-icons/bs";

export default function CourseItem({ course }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [newCourseName, setNewCourseName] = useState(course.courseName);
  const [file, setFile] = useState(null);
  const [isFileViewOpen, setIsFileViewOpen] = useState(false);
  const [errors, setErrors] = useState({
    fileError: "",
    savingError: "",
    deletionError: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [wantRevision, setwantRevision] = useState(course.wantRevision);
  const [isActive, setIsActive] = useState(course.isActive);
  const [editMode, setEditMode] = useState(false);
  const [scheduleCount, setScheduleCount] = useState(
    course.ActivityScheduleCount
  );
  const [editableReps, setEditableReps] = useState(course.spaceRepetition);
  const [originalReps, setOriginalReps] = useState(course.spaceRepetition);

  const startEditing = () => {
    setOriginalReps([...editableReps]); // save a copy
    setEditMode(true);
  };
  const cancelEditing = () => {
    setEditableReps([...originalReps]); // restore original
    setEditMode(false);
  };
  const addNewGap = () => {

    if (editableReps.length <= 0) {
      setEditableReps([1]); // start with 1 day gap if no gaps exist
      return;
    }

    setEditableReps([
      ...editableReps,
      editableReps[editableReps.length - 1] + 1,
    ]);
  };

  const handleToggle = async () => {
    const newOpen = !open;
    setOpen(newOpen);

    if (newOpen && !topics) {
      setLoading(true);
      try {
        const res = await api.get(`/topic/${course.id}`);
        setTopics(res.data.data);
      } catch (err) {
        console.error("Fetch topics error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // TODO: Check these functions
  const handleDeleteClick = async () => {
    setIsProcessing(true);
    const { error, success } = await DeleteCourse(course.id);
    if (success) {
      setIsDeleteModalOpen(false);
    } else if (error) {
      setErrors((prev) => ({ ...prev, deletionError: error }));
    }
    setIsProcessing(false);
  };

    const handleSaveClick = async () => {
      const reqArray = [];

      if (
        course.courseName !== newCourseName ||
        isActive !== course.isActive ||
        wantRevision != course.wantRevision || editableReps.length !== course.spaceRepetition.length ||
        scheduleCount !== course.ActivityScheduleCount ||
        editableReps.some((val, idx) => val !== course.spaceRepetition[idx])
      ) {
        setIsProcessing(true);
        try {
          const res = await api.patch("updateCourse", {
            courseId: course.id,
            courseName: newCourseName,
            isActive,
            wantRevision,
            spaceRepetition: editableReps,
            ActivityScheduleCount: scheduleCount,
          });
          course.courseName = newCourseName;
          setIsEditing(false);
        } catch (err) {
          setErrors((prev) => ({
            ...prev,
            savingError: "Error while saving data. Please try again.",
          }));
        } finally {
          setIsProcessing(false);
        }
      }

      // if (file) {
      //   const MAX_FILE_SIZE = 1024 * 1024 * 1024;
      //   if (file.size > MAX_FILE_SIZE) {
      //     setErrors((prev) => ({ ...prev, fileError: "File size exceeds 1GB" }));
      //     setIsProcessing(false);
      //     return;
      //   }
      //   reqArray.push(
      //     axios.postForm("/api/uploadfile", {
      //       file: file,
      //       courseId: course.id,
      //       subjectId: subjectId,
      //     })
      //   );
      // }

      // Promise.all(reqArray)
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
    <div className="ml-4">
      <div
        onClick={handleToggle}
        className="cursor-pointer flex items-center gap-2 py-1 text-gray-800 hover:text-blue-600"
      >
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md shadow-sm mb-4 w-full cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:gap-2">
              {course.isCompleted ? (
                <BsCheckCircleFill className="text-green-500" size={20} />
              ) : (
                <BsCircle
                  className="text-gray-400 dark:text-gray-500"
                  size={20}
                />
              )}
              <h4
                className={`text-sm sm:text-lg font-semibold ${
                  isActive
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-gray-400 dark:text-gray-600"
                }`}
              >
                {newCourseName}
              </h4>
            </div>
            <div className="flex items-center space-x-2 sm:gap-2">
              {course?.notes?.length > 0 && (
                <button
                  onClick={() => setIsFileViewOpen((prev) => !prev)}
                  aria-label="View Notes"
                >
                  <NotebookPen />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-500 transition"
              >
                <Pencil size={20} />
              </button>
            </div>
          </div>

          {/* File Viewer */}
          <div
            className={clsx(
              "rounded-md bg-gray-300 dark:bg-gray-700 p-4 mt-3 transition-max-height duration-700 ease-in-out w-full overflow-hidden",
              isFileViewOpen
                ? "flex max-h-96 opacity-100"
                : "hidden max-h-0 opacity-0"
            )}
          >
            {course?.notes?.length > 0 && (
              <div className="mt-2 transition-max-height duration-700 ease-in-out w-full">
                <p className="text-sm font-semibold">Notes:</p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 w-full">
                  {course.notes.map((note, idx) => (
                    <li
                      key={idx}
                      className="max-w-full truncate"
                      title={note.fileName}
                    >
                      <a
                        href={`/api/files/${note.filePath}`}
                        target="_blank"
                        className="text-blue-600 underline dark:text-blue-400"
                        rel="noopener noreferrer"
                      >
                        {note.fileName}
                      </a>
                      <p className="flex flex-col w-full text-wrap ml-3">
                        <span className="font-bold">Uploaded At:</span>
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

          {/* Modal for Editing Course */}
          {isEditing && (
            <div
              className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-2"
              onDoubleClick={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative max-w-lg w-full">
                <button
                  className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                  onClick={(e) => {
                    if (!isProcessing) {
                      e.stopPropagation();
                      setIsEditing(false);
                    }
                  }}
                >
                  <X size={24} />
                </button>

                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Edit Course
                </h3>

                <div className="mb-4">
                  <label className="block text-gray-600 dark:text-gray-400 mb-1">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={newCourseName}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 dark:bg-gray-700 dark:text-gray-200"
                  />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-2">
                    <FilePlus2 size={20} />
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Upload File
                    </span>
                  </label>
                  {file && (
                    <p
                      className="text-sm text-gray-500 dark:text-gray-400 max-w-[12rem] sm:w-fit overflow-hidden truncate"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="inline-flex items-center text-gray-600 dark:text-gray-400">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => {
                        e.stopPropagation();
                        setIsActive(e.target.checked);
                      }}
                      className="mr-2"
                    />
                    {isActive ? "Active" : "Deactivated"}
                  </label>
                </div>
                <div className="mb-4">
                  <label className="inline-flex items-center text-gray-600 dark:text-gray-400">
                    <input
                      type="checkbox"
                      checked={wantRevision}
                      onChange={(e) => {
                        e.stopPropagation();
                        setwantRevision(e.target.checked);
                      }}
                      className="mr-2"
                    />
                    Do You Want Revision
                  </label>
                </div>
                <div className="mb-4 flex items-center gap-3 text-sm sm:text-base">
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    Activity Schedule Count:
                  </p>

                  <button
                    onClick={() =>
                      setScheduleCount((pre) => (pre > 0 ? pre - 1 : 0))
                    }
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    aria-label="Decrease count"
                  >
                    <Minus className="w-4 h-4 text-gray-800 dark:text-white" />
                  </button>

                  <span className="px-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {scheduleCount}
                  </span>

                  <button
                    onClick={() => setScheduleCount((pre) => pre + 1)}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    aria-label="Increase count"
                  >
                    <Plus className="w-4 h-4 text-gray-800 dark:text-white" />
                  </button>
                </div>
                <div className="text-gray-700 mb-2">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      📈 Spaced Repetition Journey:
                    </h2>
                    <div className="flex gap-4 mt-4">
                      {editMode ? (
                        <>
                          <button
                            onClick={addNewGap}
                            className="text-sm text-green-600 hover:underline"
                          >
                            ➕ Add Revision Gap
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-sm text-gray-600 hover:underline"
                          >
                            ❌ Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={startEditing}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          ✏️ Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {editMode ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editableReps.map((gap, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={gap}
                            onChange={(e) => {
                              const updated = [...editableReps];
                              updated[index] = parseInt(e.target.value) || 0;
                              setEditableReps(updated);
                            }}
                            className="w-20 px-3 py-1 rounded-full border text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                          <span className="text-gray-500 text-sm">
                            {index == 0 ? "Notes" : "Rev " + index}
                          </span>
                          <button
                            onClick={() => {
                              const updated = [...editableReps];
                              updated.splice(index, 1);
                              setEditableReps(updated);
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editableReps.length > 0 ? (
                        editableReps.map((gap, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm shadow-sm"
                          >
                            <span className="text-gray-600">{gap}d +</span>
                            <span className="font-semibold">{index == 0 ? "Notes" : "Rev " + index}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No revision data available.</p>
                      )}
                    </div>
                  )}
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

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 flex justify-center items-center bg-gray-700 bg-opacity-75 z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <p className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  Delete Course
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete this course? You will lose all
                  data related to it.
                </p>

                {errors.deletionError && (
                  <p className="text-red-600 w-full text-center">
                    {errors.deletionError}
                  </p>
                )}

                <div className="flex justify-around mt-4">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {loading && (
          <Loader2 size={14} className="animate-spin ml-1 text-gray-500" />
        )}
      </div>
      {open && (
        <div className="ml-4 border-l-2 border-purple-500 rounded-xl pl-2">
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            topics?.map((topic) => <TopicItem key={topic.id} topic={topic} />)
          )}
        </div>
      )}
    </div>
  );
}
