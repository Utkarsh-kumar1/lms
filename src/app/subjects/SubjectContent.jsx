// "use client";
// import React, { useState } from "react";
// import SubjectCard from "./SubjectCard";
// import { Check, Loader, X } from "lucide-react";
// import { IoAddCircleSharp } from "react-icons/io5";
// import { AddNewSubjectAction } from "@/actions/AddNewSubjectAction";

// import { useOptimistic } from "react";  

// export default function SubjectContent({ subjects }) {
//   const [isAddingSubject, setIsAddingSubject] = useState(false);
//   const [subjectInput, setSubjectInput] = useState("");
//   const [errors, setErrors] = useState({ errorwhileSaving: "" });
//   const [optimisticSubject, addOptimisticSubject] = useOptimistic(
//     subjects,
//     (state, newSubject) => {
//       return [...state, ...newSubject];
//     }
//   );

//   const handleInputChange = (e) => {
//     if (errors.errorwhileSaving) {
//       setErrors((prev) => ({ ...prev, errorwhileSaving: "" }));
//     }
//     setSubjectInput(e.target.value);

//     // Auto-resize the textarea based on content
//     e.target.style.height = "auto"; // Reset height
//     e.target.style.height = `${e.target.scrollHeight}px`; // Set height based on content
//   };

//   return (
//     <>
//       <div className="">
//         {subjects?.length > 0 ? (
//           optimisticSubject.map((subject, index) => (
//             <SubjectCard key={index} subject={subject} />
//           ))
//         ) : (
//           <p className="text-lg text-gray-500 text-center">
//             No subjects found.
//           </p>
//         )}
//       </div>
     

//       {isAddingSubject ? (
//         <form
//           className="mt-8 space-y-4 flex flex-col items-center"
//           action={async (formdata) => {
//             const input = formdata.get("subjectName");
//             if (!input) {
//               return;
//             }
//             const subjectNameArray = input
//               .split(";")
//               .map((subject) => subject.trim());

//             const subjects = subjectNameArray?.map((subjectName) => {
//               return { owner: Math.random(), subjectName };
//             });

//             addOptimisticSubject(subjects);

//             const { error, success } = await AddNewSubjectAction(
//               subjectNameArray
//             );
//             console.log(error, success);
//             if (success) {
//               setIsAddingSubject(false);
//               setSubjectInput("");
//               return;
//             } else if (error) {
//               setErrors((prev) => ({ ...prev, errorwhileSaving: error }));
//             }
//           }}
//         >
//           <textarea
//             autoFocus
//             required
//             name="subjectName"
//             placeholder="Enter subjects (semi-colon separated)"
//             value={subjectInput}
//             onChange={handleInputChange}
//             maxLength={225}
//             className="text-center text-lg font-semibold text-gray-800 border-b border-gray-400 outline-none bg-transparent w-full placeholder:text-gray-500 sm:text-lg sm:placeholder:text-base py-2 resize-none overflow-hidden"
//             rows={1}
//           />

//           {errors.errorwhileSaving && <div>{errors.errorwhileSaving}</div>}

//           <div className="flex space-x-4">
//             <button
//               type="button"
//               className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
//               onClick={() => setIsAddingSubject(false)}
//             >
//               <X className="h-5 w-5" />
//               <span className="hidden sm:block">Cancel</span>
//             </button>
//             <button
//               type="submit"
//               className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
//             >
//               <Check className="h-5 w-5" />
//               <span className="hidden sm:block">Save</span>
//             </button>
//           </div>
//         </form>
//       ) : (
//         <div className="mt-8 w-full flex items-center justify-center">
//           <button
//             type="button"
//             className="text-green-600 hover:text-green-700 focus:outline-none"
//             onClick={() => setIsAddingSubject(true)}
//           >
//             <IoAddCircleSharp className="h-12 w-12 sm:h-14 sm:w-14" />
//           </button>
//         </div>
//       )}
//     </>
//   );
// }

"use client";
import React, { useState } from "react";
import SubjectCard from "./SubjectCard";
import { Check, X } from "lucide-react";
import { IoAddCircleSharp } from "react-icons/io5";
import { AddNewSubjectAction } from "@/actions/AddNewSubjectAction";
import { useOptimistic } from "react";

export default function SubjectContent({ subjects }) {
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [subjectInput, setSubjectInput] = useState("");
  const [errors, setErrors] = useState({ errorwhileSaving: "" });
  const [optimisticSubject, addOptimisticSubject] = useOptimistic(
    subjects,
    (state, newSubject) => [...state, ...newSubject]
  );

  const handleInputChange = (e) => {
    if (errors.errorwhileSaving) {
      setErrors((prev) => ({ ...prev, errorwhileSaving: "" }));
    }
    setSubjectInput(e.target.value);
    e.target.style.height = "auto"; // Reset height
    e.target.style.height = `${e.target.scrollHeight}px`; // Auto resize based on content
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    const input = subjectInput.trim();
    if (!input) return;

    const subjectNameArray = input.split(";").map((subject) => subject.trim());
    const subjects = subjectNameArray.map((subjectName) => ({
      owner: Math.random(),
      subjectName,
    }));

    addOptimisticSubject(subjects);

    const { error, success } = await AddNewSubjectAction(subjectNameArray);
    if (success) {
      setIsAddingSubject(false);
      setSubjectInput("");
    } else if (error) {
      setErrors((prev) => ({ ...prev, errorwhileSaving: error }));
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen flex flex-col gap-3">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Subjects</h1>
        <button
          type="button"
          className="text-green-600 hover:text-green-700 focus:outline-none"
          onClick={() => setIsAddingSubject(true)}
        >
          <IoAddCircleSharp className="h-10 w-10 sm:h-12 sm:w-12" />
        </button>
      </div>

      {/* Subject List */}
      <div className="flex w-full flex-col">
        {optimisticSubject.length > 0 ? (
          optimisticSubject.map((subject, index) => (
            <SubjectCard key={index} subject={subject} />
          ))
        ) : (
          <p className="text-lg text-gray-500 text-center">
            No subjects found.
          </p>
        )}
      </div>

      {/* Modal for Adding Subject */}
      {isAddingSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Add New Subject
            </h2>
            <form onSubmit={handleAddSubject} className="space-y-5">
              <textarea
                autoFocus
                required
                name="subjectName"
                placeholder="Enter subjects (semi-colon separated)"
                value={subjectInput}
                onChange={handleInputChange}
                maxLength={225}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500 text-gray-900 placeholder-gray-400 resize-none"
                rows={2}
              />
              {errors.errorwhileSaving && (
                <p className="text-sm text-red-600">
                  {errors.errorwhileSaving}
                </p>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                  onClick={() => setIsAddingSubject(false)}
                >
                  <X className="h-5 w-5 inline-block mr-1" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Check className="h-5 w-5 inline-block mr-1" />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

