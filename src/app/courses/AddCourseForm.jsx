"use client";
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { X, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

async function fetchSubject() {
  try {
    const response = await axios.get("/api/subject");
    return response.data.data; // Assuming the data is in `response.data`
  } catch (error) {
    throw new Error("Error while getting the Subject");
  }
}

const AddCourseForm = ({ setIsCourseAdding, onCourseAdded, subjectId }) => {
  const [courseNames, setCourseNames] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(subjectId || null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({
    courseNames: "",
    subject: "",
    fetch: "",
  });

  useEffect(() => {
    if (!subjectId) {
      const loadSubjects = async () => {
        try {
          const data = await fetchSubject();
          setSubjects(data);
        } catch (error) {
          setErrors({ ...errors, fetch: error.message });
        } finally {
          setLoading(false);
        }
      };

      loadSubjects();
    } else {
      setLoading(false);
    }
  }, [subjectId]);

  const validateForm = () => {
    const newErrors = { courseNames: "", subject: "" };

    if (!courseNames) newErrors.courseNames = "Course Names are required.";
    
    if (!subjectId && !selectedSubject)
      newErrors.subject = "Subject is required.";

    // Check for empty values in courseNames
    const courseNamesArray = courseNames.split(",").map((name) => name.trim());
    const hasEmptyValues = courseNamesArray.some((name) => name === "");
    if (hasEmptyValues)
      newErrors.courseNames = "Course Names should not be empty.";

    setErrors(newErrors);
    return !newErrors.courseNames && (!newErrors.subject || subjectId);
  };

  const handleSaveClick = async () => {
    if (!validateForm()) return;

    // Clear error if validation passes
    setErrors({ ...errors, courseNames: "", subject: "" });

    try {
      const response = await axios.post("/api/updateCourse", {
        courseNames: courseNames.split(",").map((name) => name.trim()),
        subjectId: selectedSubject,
      });

      if (response.status === 200) {
        if(response.data.data == null)
        {
          setErrors({ ...errors, courseNames: "CourseName allready Exist" });
          return ;
        }
        onCourseAdded(response.data.data);
        setIsCourseAdding(false);
      }
    } catch (error) {
      setErrors({ ...errors, fetch: "Error while saving the courses." });
    }
  };

  const handleCancelClick = () => {
    setIsCourseAdding(false);
  };

  if (loading) return <div>Loading...</div>;
  if (errors.fetch) return <div>{errors.fetch}</div>;

  return (
    <div className="sm:p-6 p-6 mb-4 rounded-lg shadow-lg transition-transform transform flex flex-col  gap-4 items-center w-full">
      <div className="flex flex-col sm:flex-row gap-4 items-center w-full ">
        <div className="relative w-full ">
          <input
            type="text"
            autoFocus
            value={courseNames}
            placeholder="Course Names (comma separated)"
            onChange={(e) => setCourseNames(e.target.value)}
            className="text-lg font-semibold text-gray-800 border-b border-gray-400 outline-none bg-transparent w-full text-center p-2 placeholder:text-sm sm:placeholder:text-lg"
            required
          />
          {errors.courseNames && (
            <p className="text-red-500 text-sm">{errors.courseNames}</p>
          )}
        </div>
        {!subjectId && (
          <div className=" w-full sm:w-[180px]">
            <Select
              onValueChange={(value) => {
                if (value) {
                  setErrors({ ...errors, subject: "" });
                }
                setSelectedSubject(value);
              }}
              onOpenChange={(open) => setIsDropdownOpen(open)}
            >
              <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent className="z-50">
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subject && (
              <p className="text-red-500 text-sm  bottom-[-1.5rem]">
                {errors.subject}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center justify-around sm:justify-end gap-7  w-full ">
        <button
          onClick={handleSaveClick}
          className={clsx(
            "flex items-center justify-center text-lg font-semibold  py-3 px-5 border border-transparent rounded-md shadow-sm text-white",
             !selectedSubject || !courseNames 
              ? "bg-gray-400"
              : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          )}
          disabled={
             !selectedSubject || !courseNames 
          }
        >
          <Check className="mr-2" />
          <span>Save</span>
        </button>
        <button
          onClick={handleCancelClick}
          className="flex items-center justify-center text-lg font-semibold  py-3 px-5 border border-transparent rounded-md shadow-sm text-white bg-red-500 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <X className="mr-2" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddCourseForm;
