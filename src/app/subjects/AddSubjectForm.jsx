"use client";
import React, { useState } from "react";
import clsx from "clsx";
import { X, Check } from "lucide-react";
import axios from "axios";

const AddSubjectForm = ({ setIsAddingSubject, onSubjectAdded }) => {
  const [subjectInput, setSubjectInput] = useState("");
  const [errors, setErrors] = useState({ subject: "", fetch: "" });

  const validateForm = () => {
    const newErrors = { subject: "" };

    if (!subjectInput.trim()) newErrors.subject = "Subjects are required.";

    // Check for empty values in subjectInput
    const subjectArray = subjectInput
      .split(";")
      .map((subject) => subject.trim());
    const hasEmptyValues = subjectArray.some((subject) => subject === "");
    if (hasEmptyValues) newErrors.subject = "Subjects should not be empty.";

    setErrors(newErrors);
    return !newErrors.subject;
  };

  const handleSaveClick = async () => {
    if (!validateForm()) return;

    // Clear error if validation passes
    setErrors({ ...errors, subject: "" });

    try {
      const response = await axios.post("/api/updateSubject", {
        subjects: subjectInput.split(";").map((subject) => subject.trim()),
      });

      if (response.status === 200) {
        if (response.data.data == null) {
          setErrors({ ...errors, subject: "Subject already exists." });
          return;
        }
        onSubjectAdded(response.data.data);
        setIsAddingSubject(false);
      }
    } catch (error) {
      console.error(error);
      setErrors({ ...errors, fetch: "Error while saving the subjects." });
    }
  };

  const handleCancelClick = () => {
    setIsAddingSubject(false);
  };

  return (
    <div
      className={clsx(
        "sm:p-6 p-2 mb-4 rounded-lg shadow-lg transition-transform transform hover:scale-[1.01] flex items-center w-full"
      )}
    >
      <div className="flex items-center flex-col gap-4 justify-between w-full">
        <div className="w-full">
          <input
            type="text"
            autoFocus
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            placeholder="Enter subjects (semi-colon seperated) "
            className="text-lg font-semibold text-gray-800 border-b border-gray-400 outline-none bg-transparent w-full placeholder:text-sm sm:placeholder:text-lg text-center"
          />
          {errors.subject && (
            <p className="text-red-500 text-sm">{errors.subject}</p>
          )}
        </div>
        <div className="flex items-center justify-around sm:justify-end gap-7  w-full ">
          <button
            onClick={handleSaveClick}
            className={clsx(
              "flex items-center justify-center text-lg font-semibold  py-3 px-5 border border-transparent rounded-md shadow-sm text-white",
              !subjectInput
                ? "bg-gray-400"
                : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            )}
            disabled={
              !subjectInput
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
        {errors.fetch && (
          <p className="text-red-500 text-sm text-center mt-2">
            {errors.fetch}
          </p>
        )}
      </div>
    </div>
  );
};

export default AddSubjectForm;
