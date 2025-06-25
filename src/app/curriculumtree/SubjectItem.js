import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FilePlus2,
  Loader2,
  NotebookPen,
  Pencil,
  X,
} from "lucide-react";
import CourseItem from "./CourseItem";
import api from "@/axios";
import clsx from "clsx";
import { IoAddCircleSharp } from "react-icons/io5";

export default function SubjectItem({ subject }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState(null);
  const [isFileViewOpen, setIsFileViewOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState(subject.subjectName);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({
    fileError: "",
    savingError: "",
    errorWhileSavingData: "",
  });
  const [isSavingData, setIsSavingData] = useState(false);
  const [isAddingCourse, setIsAddingCourse] = useState(false);

  const handleToggle = async () => {
    const newOpen = !open;
    setOpen(newOpen);

    if (newOpen && !courses) {
      setLoading(true);
      try {
        const res = await api.get(`/course/${subject.id}`);
        setCourses(res.data.data);
      } catch (err) {
        console.error("Fetch courses error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const getColor = () => {
    if (subject.isCompleted) {
      return "bg-gradient-to-r from-green-100 to-green-300 dark:from-green-700 dark:to-green-900";
    }

    return "bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900";
  };

  // TODO: Check these functions
  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const handleSaveClick = async () => {
    // const reqArray = [];

    //Updation Subject Name
    if (subject.subjectName != newSubjectName) {
      setIsSavingData(true);
      try {
        const response = await api.patch(
          "updateSubjectName",
          {
            subjectName: newSubjectName,
            subjectId: subject.id,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        subject.subjectName = newSubjectName;
        setIsEditModalOpen(false);
      } catch (error) {
        setNewSubjectName(subject.subjectName);

        setErrors((prev) => ({
          ...prev,
          savingError: "Error while Saving Subject Name",
        }));
      } finally {
        setIsSavingData(false);
      }
    }

    // TODO: File Upload

    //uploading file
    // if (file) {
    //   const MAX_FILE_SIZE = 1024 * 1024 * 1024; //1 GB
    //   if (file.size > MAX_FILE_SIZE) {
    //     setErrors((prev) => ({ ...prev, fileError: "File Size Exceed" }));
    //   } else {
    //     const fileUploadResponse = axios.postForm("/api/uploadfile", {
    //       file: file,
    //       subjectId: subject.id,
    //     });
    //     reqArray.push(fileUploadResponse);
    //   }
    // }

    // Promise.all([...reqArray])
    //   .then(() => {
    //     router.refresh();
    //     setIsSavingData(false);

    //     setIsEditModalOpen(false);
    //     setFile(null);
    //   })
    //   .catch((err) => {
    //     setErrors((prev) => ({
    //       ...prev,
    //       savingError: "Error while Saving Data Retry",
    //     }));
    //   })
    //   .finally(() => {
    //     setIsSavingData(false);
    //   });
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
    try {
      console.log("Deleting subject:", subject.id);
      const response = await api.delete(`deleteSubject/${subject.id}`);
      // console.log("Subject deleted successfully:", response);

      setIsModalOpen(false);
      setIsEditModalOpen(false);
    } catch (error) {
      setErrors((prev) => ({ ...prev, savingError: error }));
      setIsModalOpen(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const courseNameArray = formData
      .get("CourseName")
      .split(";")
      .map((name) => name.trim())
      .filter((name) => name);

    // Check for duplicates, empty strings, and whitespace
    const uniqueCourses = new Set(courseNameArray);
    const filteredCourses = Array.from(uniqueCourses).filter(
      (subject) => subject && subject.trim() !== ""
    );
    if (filteredCourses.length === 0) {
      setErrors((prev) => ({
        ...prev,
        errorwhileSaving: "Please enter valid courses.",
      }));
      return;
    }

    try {
      const res = await api.post("/addCourses", {
        subjectId: subject?.id,
        courses: filteredCourses,
      });
      console.log("Courses added successfully:", res);

      setCourses((prev) => [...res.data.data, ...prev]);

      setIsAddingCourse(false); // here
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

  return (
    <div className="ml-4 ">
      <div
        onClick={handleToggle}
        className="group cursor-pointer flex items-center gap-2 py-1 text-gray-800 hover:text-blue-600"
      >
        <div
          className={clsx(
            "p-4 mb-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[101%] flex flex-col sm:flex-row items-center gap-4 justify-between overflow-auto cursor-pointer w-full ",
            getColor()
          )}
        >
          <div className="flex w-full">
            <div className="w-full sm:w-6/12 sm:mr-auto">
              <p className="flex items-center text-lg font-semibold text-gray-800 dark:text-gray-200 text-wrap truncate">
                {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                {newSubjectName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Status: {subject.isCompleted ? "Completed" : "Not Completed"}
              </p>
            </div>

            <div className="group-hover:flex items-center justify-end gap-2 w-full hidden">
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
                className="text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-500 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddingCourse(true);
                }}
              >
                <IoAddCircleSharp className="h-10 w-10" />
              </button>
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Edit subject"
              >
                <Pencil className="m-1" size={20} />
              </button>
            </div>
            {/* Notes section */}
            <div
              className={clsx(
                "rounded-md bg-gray-300 dark:bg-gray-800 p-4 mt-3 transition-max-height duration-700 ease-in-out w-full overflow-hidden",
                isFileViewOpen
                  ? "flex max-h-96 opacity-100"
                  : "hidden max-h-0 opacity-0"
              )}
            >
              {subject?.notes?.length > 0 && (
                <div className="mt-2 transition-max-height duration-700 ease-in-out w-full">
                  <p className="text-sm font-semibold dark:text-gray-300">
                    Notes:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-400 w-full">
                    {subject.notes.map((note, idx) => (
                      <li
                        key={idx}
                        className="max-w-full truncate"
                        title={note.fileName}
                      >
                        <a
                          href={`api/files/${note.filePath}`}
                          target="_blank"
                          className="text-blue-600 dark:text-blue-400 underline"
                          rel="noopener noreferrer"
                        >
                          {note.fileName}
                        </a>
                        <p className="flex flex-col w-full text-wrap ml-3">
                          <span className="font-bold dark:text-gray-300">
                            {" "}
                            Uploaded At :{" "}
                          </span>
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
          <div
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Edit Subject</h2>
                <button
                  onClick={(e) => {
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
          <div
            className="fixed inset-0 flex justify-center items-center bg-gray-700 bg-opacity-75 z-50 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white p-6 rounded-lg shadow-xl transform transition-all w-full max-w-sm">
              <p className="text-lg font-semibold mb-4">Delete Subject</p>
              <p>
                Are you sure you want to delete this subject? , You will lost
                all the data related to this subject?{" "}
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

        {loading && (
          <Loader2 size={14} className="animate-spin ml-1 text-gray-500" />
        )}
      </div>
      {/* Add Course Form Modal */}
      {isAddingCourse && (
        <form
          onSubmit={handleAddCourse}
          className="fixed inset-0 bg-gray-800 dark:bg-black bg-opacity-30 dark:bg-opacity-30 flex items-center justify-center z-50"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              {subject.subjectName} - Add a New Course
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
                  setIsAddingCourse(false);
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
      {open && (
        <div className="ml-4 border-l-2 border-blue-500 rounded-xl pl-2">
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            courses?.map((course) => (
              <CourseItem key={course.id} course={course} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
