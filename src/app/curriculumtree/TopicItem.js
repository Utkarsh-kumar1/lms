import { useState } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import api from "@/axios";

import clsx from "clsx";
import { FilePlus2, NotebookPen } from "lucide-react";
import { BsCheckCircleFill, BsCircle, BsPencilSquare } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import SubTopicItem from "./SubTopicItem";
import { IoAddCircleSharp } from "react-icons/io5";

export default function TopicItem({ topic }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subtopics, setSubtopics] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [newtopicName, setnewtopicName] = useState(topic.topicName);
  const [isCompleted, setIsCompleted] = useState(topic.isCompleted);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFileViewOpen, setIsFileViewOpen] = useState(false);
  const [errors, setErrors] = useState({
    deletionError: "",
    savingError: "",
    fileError: "",
  });
  const [isAddingSubTopic, setIsAddingSubTopic] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const handleToggle = async () => {
    const newOpen = !open;
    setOpen(newOpen);

    if (newOpen && !subtopics) {
      setLoading(true);
      try {
        const res = await api.get(`/subtopic/${topic.id}`);
        setSubtopics(res.data.data);
      } catch (err) {
        console.error("Fetch subtopics error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // TODO: Check these functions
  // useEffect(() => {
  //     const handler = setTimeout(() => {
  //       if (debouncedIsCompleted !== topic.isCompleted) {
  //         // Perform the network call after the debounce delay
  //         setIsProcessing(true);
  //         axios
  //           .patch("/api/updateTopic", {
  //             id: topic.id,
  //             courseId,
  //             subjectId,
  //             isCompleted: debouncedIsCompleted,
  //           })
  //           .then(() => {
  //             router.refresh();
  //             setIsProcessing(false);
  //           })
  //           .catch((err) => {
  //             setErrors((prev) => ({
  //               ...prev,
  //               savingError: "Error while saving completion status.",
  //             }));
  //             setIsProcessing(false);
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
  //     topic.id,
  //     router,
  //     topic.isCompleted,
  //   ]);

  const handleSubTopicDelete = async (subtopicId) => {
    setIsProcessing(true);
    setErrors((prev) => ({ ...prev, deletionError: "" }));

    try {
      const response = await api.delete("/deleteSubtopic", {
        data: {
          subTopicId: subtopicId,
          topicId: topic.id,
        },
      });

      if (response.data.success) {
        // ✅ Remove deleted item from frontend
        setSubtopics((prev) => prev.filter((s) => s.id !== subtopicId));
        setIsDeleteModalOpen(false);
      } else {
        setErrors((prev) => ({
          ...prev,
          deletionError: response.data.message || "Could not delete subtopic",
        }));
      }
    } catch (err) {
      console.error("Error while deleting subtopic:", err);
      setErrors((prev) => ({
        ...prev,
        deletionError: "Error while deleting subtopic. Please try again.",
      }));
    } finally {
      setIsProcessing(false);
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
    // const reqArray = [];

    if (topic.topicName !== newtopicName || isCompleted !== topic.isCompleted) {
      setIsProcessing(true);

      try {
        console.log("Topic details:", topic);
        const response = await api.patch("updateTopic", {
          topicName: newtopicName,
          topicId: topic.id,
          courseId: topic.course,
          // isCompleted,
        });
        // topic.isCompleted = isCompleted;
        topic.topicName = newtopicName;
        setIsEditing(false);
      } catch (err) {
        console.error("Error while saving topic:", err);
        setErrors((prev) => ({
          ...prev,
          savingError: "Error while saving data. Please try again.",
        }));
      } finally {
        setIsProcessing(false);
      }
    }

    // if (file) {
    //   const MAX_FILE_SIZE = 1024 * 1024 * 1024; //1GB
    //   if (file.size > MAX_FILE_SIZE) {
    //     setErrors((prev) => ({
    //       ...prev,
    //       fileError: "File size exceeds 1GB",
    //     }));
    //     return;
    //   } else {
    //     const fileUploadResponse = axios.postForm("/api/uploadfile", {
    //       file: file,
    //       courseId: courseId,
    //       subjectId: subjectId,
    //       topicId: topic.id,
    //     });
    //     reqArray.push(fileUploadResponse);
    //   }
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

  const handleAddSubTopic = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const subTopicNameArray = formData
      .get("CourseName")
      .split(";")
      .map((name) => name.trim())
      .filter((name) => name);

    // Check for duplicates, empty strings, and whitespace
    const uniqueSubTopics = new Set(subTopicNameArray);
    const filteredSubTopics = Array.from(uniqueSubTopics).filter(
      (subject) => subject && subject.trim() !== ""
    );
    if (filteredSubTopics.length === 0) {
      setErrors((prev) => ({
        ...prev,
        errorwhileSaving: "Please enter valid topics.",
      }));
      return;
    }

    try {
      const res = await api.post("/addSubTopic", {
        topicId: topic?.id,
        subtopics: filteredSubTopics,
      });
      console.log("Courses added successfully:", res);

      setSubtopics((prev) => [...prev, ...res.data.data]);

      setIsAddingSubTopic(false); // here
    } catch (error) {
      console.error("Error adding courses:", error);
      if (error.response && error.response.data) {
        setErrors((prev) => ({
          ...prev,
          errorwhileSaving: error.response.data.message,
        }));
      } else {
        setErrors((prev) => ({ ...prev, errorwhileSaving: error }));
      }
    }
  };

  const handleDragStart = (index) => setDragIndex(index);

  const handleDragOver = (e) => {
    e.preventDefault(); // necessary to allow drop
  };

  const handleDrop = async (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) return;

    const updated = [...subtopics];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, moved);

    // Reset indexes
    const reindexed = updated.map((s, i) => ({
      ...s,
      subTopicIndex: i + 1,
    }));

    // 🔍 Only send items whose index changed
    const updatesToSend = reindexed
      .filter((item, idx) => {
        const original = subtopics.find((s) => s.id === item.id);
        return original?.subTopicIndex !== item.subTopicIndex;
      })
      .map((item) => ({
        id: item.id,
        subTopicIndex: item.subTopicIndex,
      }));

    if (updatesToSend.length === 0) {
      setDragIndex(null);
      return;
    }

    try {
      await api.patch("/updateSubtopicIndex", {
        updates: updatesToSend,
        topicId: topic.id,
      });

      // ✅ Only update state after successful API call
      setSubtopics(reindexed);
    } catch (err) {
      console.error("Error while updating order:", err);
    } finally {
      setDragIndex(null);
    }
  };

  return (
    <div className="ml-4">
      <div
        onClick={handleToggle}
        className="group cursor-pointer flex items-center gap-2 py-1 text-gray-800 hover:text-blue-600 w-full"
      >
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow-sm mb-4 cursor-pointer w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 ">
              <button
                // onClick={toggleCompletionStatus}
                aria-label="Toggle Completion Status"
              >
                {topic.isCompleted ? (
                  <BsCheckCircleFill className="text-green-500" size={20} />
                ) : (
                  <BsCircle
                    className="text-gray-400 dark:text-gray-500"
                    size={20}
                  />
                )}
              </button>
              <h4 className="text-sm sm:text-lg font-semibold text-gray-700 dark:text-gray-300 w-full">
                {topic.topicIndex}. {newtopicName}
              </h4>
            </div>

            <div className="group-hover:flex items-center justify-end gap-2 hidden">
              {topic?.notes?.length > 0 && (
                <button
                  onClick={() => setIsFileViewOpen((prev) => !prev)}
                  aria-label="View Notes"
                >
                  <NotebookPen />
                </button>
              )}
              <button
                className="text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-500 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddingSubTopic(true);
                }}
              >
                <IoAddCircleSharp className="h-8 w-8" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <BsPencilSquare className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            className={clsx(
              "rounded-md bg-gray-300 dark:bg-gray-800 p-4 mt-3 transition-max-height duration-700 ease-in-out w-full overflow-hidden dark:shadow-2xl ",
              isFileViewOpen
                ? "flex max-h-96 opacity-100"
                : "hidden max-h-0 opacity-0"
            )}
          >
            {topic?.notes?.length > 0 && (
              <div className="mt-2 transition-max-height duration-700 ease-in-out w-full">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Notes:
                </p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 w-full">
                  {topic.notes.map((note, idx) => (
                    <li
                      key={idx}
                      className="max-w-full truncate"
                      title={note.fileName}
                    >
                      <a
                        href={`/api/files/${note.filePath}`}
                        target="_blank"
                        className="text-blue-600 dark:text-blue-400 underline"
                        rel="noopener noreferrer"
                      >
                        {note.fileName}
                      </a>
                      <p className="flex flex-col w-full text-wrap ml-3 dark:text-gray-400">
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

          {isAddingSubTopic && (
            <form
              onSubmit={handleAddSubTopic}
              className="fixed inset-0 bg-gray-800 dark:bg-black bg-opacity-30 dark:bg-opacity-30 flex items-center justify-center z-50"
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  {topic?.topicName} - Add a New TopicItem
                </h2>
                <div className="sm:p-6 p-4 mb-4 rounded-lg shadow-lg transition-transform transform flex flex-col gap-4 items-center w-full max-w-lg mx-auto bg-white dark:bg-gray-800">
                  <div className="flex flex-col gap-4 items-center w-full">
                    {/* Input for Course Names */}
                    <div className="relative w-full">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Course Names (semi-colon separated)"
                        className="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-400 dark:border-gray-600 outline-none bg-transparent w-full text-center sm:text-left p-2 placeholder:text-sm sm:placeholder:text-lg"
                        required
                        name="CourseName"
                      />
                    </div>
                  </div>
                </div>
                {errors.errorWhileSavingData && (
                  <p className="w-full text-center text-red-400 dark:text-red-300">
                    {errors.errorWhileSavingData}
                  </p>
                )}
                {/* Save and Cancel Buttons */}
                <div className="flex items-center justify-around w-full">
                  <button
                    className="mt-4 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 transition"
                    onClick={() => {
                      setIsAddingSubTopic(false);
                      setErrors((prev) => ({
                        ...prev,
                        errorWhileSavingData: "",
                      }));
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="mt-4 text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-500 transition"
                    type="submit"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          )}

          {isEditing && (
            <div
              className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative max-w-lg w-full">
                <button
                  className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                  onClick={() => {
                    if (!isProcessing) {
                      setIsEditing(false);
                    }
                  }}
                >
                  <IoClose size={24} />
                </button>

                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Edit Topic
                </h3>

                <div className="mb-4">
                  <label className="block text-gray-600 dark:text-gray-300 mb-1">
                    Topic Name
                  </label>
                  <input
                    type="text"
                    value={newtopicName}
                    onChange={(e) => setnewtopicName(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

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
                      className="text-sm text-gray-500 dark:text-gray-400 max-w-[12rem] sm:w-fit overflow-hidden truncate"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                  )}
                </div>

                {/* <div className="mb-4">
                  <label className="inline-flex items-center text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={(e) => setIsCompleted(e.target.checked)}
                      className="mr-2"
                    />
                    Mark as Completed
                  </label>
                </div> */}

                {errors.fileError && (
                  <p className="text-red-600 dark:text-red-500 w-full text-center">
                    {errors.fileError}
                  </p>
                )}
                {errors.savingError && (
                  <p className="text-red-600 dark:text-red-500 w-full text-center">
                    {errors.savingError}
                  </p>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 px-4 py-2 rounded-md text-white disabled:cursor-progress"
                    onClick={() => setIsDeleteModalOpen(true)}
                    disabled={isProcessing}
                  >
                    Delete
                  </button>
                  <button
                    className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400 text-white px-4 py-2 rounded-md disabled:cursor-progress"
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
            <div
              className="fixed inset-0 flex justify-center items-center bg-gray-700 bg-opacity-75 dark:bg-opacity-90 z-50 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl transform transition-all w-full max-w-sm">
                <p className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  Delete Course
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete this Course? You will lose all
                  data related to this Course.
                </p>

                {errors.deletionError && (
                  <p className="text-red-600 dark:text-red-500 w-full text-center">
                    {errors.deletionError}
                  </p>
                )}
                <div className="flex justify-around mt-4">
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                    }}
                    className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-500 transition duration-200 disabled:cursor-progress"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-400 transition duration-200 disabled:cursor-progress"
                    disabled={isProcessing}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>{" "}
        {loading && (
          <Loader2 size={14} className="animate-spin ml-1 text-gray-500" />
        )}
      </div>
      {open && (
        <div className="ml-4 border-l-2 border-orange-500 rounded-xl pl-2">
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <ul className="list-disc list-inside text-gray-700">
              {subtopics?.map((sub, index) => (
                <li
                  key={sub.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  className="list-none cursor-move"
                >
                  <SubTopicItem key={sub.id} subtopic={sub} handleSubTopicDelete={handleSubTopicDelete} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
