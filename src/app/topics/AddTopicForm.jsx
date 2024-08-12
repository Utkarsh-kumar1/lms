// "use client";
// import React, { useState, useEffect } from "react";
// import clsx from "clsx";
// import { X, Check } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import axios from "axios";

// async function fetchSubject() {
//   try {
//     const response = await axios.get("/api/subject");
//     return response.data.data;
//   } catch (error) {
//     throw new Error("Error while getting the Subject");
//   }
// }

// async function fetchCourse() {
//   try {
//     const response = await axios.get("/api/course");
//     return response.data.data;
//   } catch (error) {
//     throw new Error("Error while getting the Course");
//   }
// }

// const AddTopicForm = ({
//   setIsTopicAdding,
//   onTopicAdded,
//   subjectId,
//   courseId,
// }) => {
//   const [topicName, setTopicName] = useState("");
//   const [selectedSubject, setSelectedSubject] = useState(subjectId || null);
//   const [selectedCourse, setSelectedCourse] = useState(courseId || null);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
//   const [subjects, setSubjects] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [filteredCourses, setFilteredCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [errors, setErrors] = useState({
//     topicName: "",
//     subject: "",
//     course: "",
//   });

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         if (!subjectId) {
//           const subjectsData = await fetchSubject();
//           setSubjects(subjectsData);
//         }
//         const coursesData = await fetchCourse();
//         setCourses(coursesData);
//       } catch (error) {
//         setErrors({ ...errors, fetch: error.message });
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, [subjectId]);

//   useEffect(() => {
//     if (selectedSubject) {
//       const filteredData = courses.filter(
//         (course) => course.subjectId === selectedSubject
//       );
//       setFilteredCourses(filteredData);
//     } else {
//       setFilteredCourses([]);
//     }
//   }, [selectedSubject, courses]);

//   const validateForm = () => {
//     const newErrors = { topicName: "", subject: "", course: "" };
//     if (!topicName) newErrors.topicName = "Topic Name is required.";
//     if (!selectedSubject) newErrors.subject = "Subject is required.";
//     if (!selectedCourse) newErrors.course = "Course is required.";
//     setErrors(newErrors);
//     return !newErrors.topicName && !newErrors.subject && !newErrors.course;
//   };

//   const handleSaveClick = async () => {
//     if (!validateForm()) return;

//     setErrors({ topicName: "", subject: "", course: "" });

//     try {
//       const response = await axios.post("/api/updateTopic", {
//         topicName,
//         courseId: selectedCourse,
//       });
//       if (response.status === 200) {
//         onTopicAdded(response.data.data);
//         setIsTopicAdding(false);
//       }
//     } catch (error) {
//       // console.log(error);

//       setErrors({ ...errors, fetch: "Error while saving the topic." });
//     }
//   };

//   const handleCancelClick = () => {
//     setIsTopicAdding(false);
//   };

//   if (loading) return <div>Loading...</div>;
//   if (errors.fetch) return <div>{errors.fetch}</div>;

//   return (
//     <div className="sm:p-6 p-6 mb-4 rounded-lg shadow-lg flex flex-col sm:flex-row gap-4 items-center w-full">
//       <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-11/12">
//         <div className="relative w-full sm:w-4/5">
//           <input
//             type="text"
//             value={topicName}
//             placeholder="Topic Name"
//             onChange={(e) => setTopicName(e.target.value)}
//             className="text-lg font-semibold text-gray-800 border-b border-gray-400 outline-none bg-transparent w-full text-center p-2"
//             required
//           />
//           {errors.topicName && (
//             <p className="text-red-500 text-sm mt-1">{errors.topicName}</p>
//           )}
//         </div>

//         {!subjectId && (
//           <div className="relative w-full sm:w-[180px]">
//             <Select
//               onValueChange={(value) => setSelectedSubject(value)}
//               onOpenChange={(open) => setIsDropdownOpen(open)}
//             >
//               <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
//                 <SelectValue placeholder="Select Subject" />
//               </SelectTrigger>
//               <SelectContent className="z-50">
//                 {subjects.map((subject) => (
//                   <SelectItem key={subject.id} value={subject.id}>
//                     {subject.subjectName}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             {errors.subject && (
//               <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
//             )}
//           </div>
//         )}

//         {!courseId && (
//           <div className="relative w-full sm:w-[180px]">
//             <Select
//               open={isCourseDropdownOpen}
//               onValueChange={(value) => {
//                 setSelectedCourse(value);
//                 if (errors.course) {
//                   setErrors({ ...errors, course: "" });
//                 }
//               }}
//               onOpenChange={(open) => {
//                 if (!selectedSubject) {
//                   setErrors({ ...errors, course: "First select the subject" });
//                   return;
//                 }
//                 setIsCourseDropdownOpen(open);
//                 setIsDropdownOpen(open);
//               }}
//             >
//               <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
//                 <SelectValue placeholder="Select Course" />
//               </SelectTrigger>
//               <SelectContent className="z-50">
//                 {filteredCourses.length === 0 ? (
//                   <div className="text-red-500 p-2">No Courses found</div>
//                 ) : (
//                   filteredCourses.map((course) => (
//                     <SelectItem key={course.id} value={course.id}>
//                       {course.courseName}
//                     </SelectItem>
//                   ))
//                 )}
//               </SelectContent>
//             </Select>
//             {errors.course && (
//               <p className="text-red-500 text-sm mt-1">{errors.course}</p>
//             )}
//           </div>
//         )}
//       </div>
//       <div className="flex items-center justify-between sm:gap-3 sm:justify-normal w-full sm:w-fit">
//         <button
//           onClick={handleSaveClick}
//           disabled={isDropdownOpen}
//           className={clsx(
//             "flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors",
//             isDropdownOpen ? "opacity-50 pointer-events-none" : "opacity-100"
//           )}
//         >
//           <Check className="mr-2" />
//           <span>Save</span>
//         </button>
//         <button
//           onClick={handleCancelClick}
//           disabled={isDropdownOpen}
//           className={clsx(
//             "flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors",
//             isDropdownOpen ? "opacity-50 pointer-events-none" : "opacity-100"
//           )}
//         >
//           <X className="mr-2" />
//           <span>Cancel</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AddTopicForm;
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
    return response.data.data;
  } catch (error) {
    throw new Error("Error while getting the Subject");
  }
}

async function fetchCourse() {
  try {
    const response = await axios.get("/api/course");
    return response.data.data;
  } catch (error) {
    throw new Error("Error while getting the Course");
  }
}

const AddTopicForm = ({
  setIsTopicAdding,
  onTopicAdded,
  subjectId,
  courseId,
}) => {
  const [topicNames, setTopicNames] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(subjectId || null);
  const [selectedCourse, setSelectedCourse] = useState(courseId || null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({
    topicNames: "",
    subject: "",
    course: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!subjectId) {
          const subjectsData = await fetchSubject();
          setSubjects(subjectsData);
        }
        const coursesData = await fetchCourse();
        setCourses(coursesData);
      } catch (error) {
        setErrors({ ...errors, fetch: error.message });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [subjectId]);

  useEffect(() => {
    if (selectedSubject) {
      const filteredData = courses.filter(
        (course) => course.subjectId === selectedSubject
      );
      setFilteredCourses(filteredData);
    } else {
      setFilteredCourses([]);
    }
  }, [selectedSubject, courses]);

  const validateForm = () => {
    const newErrors = { topicNames: "", subject: "", course: "" };
    if (!topicNames) newErrors.topicNames = "Topic Names are required.";
    if (!selectedSubject) newErrors.subject = "Subject is required.";
    if (!selectedCourse) newErrors.course = "Course is required.";
    setErrors(newErrors);
    return !newErrors.topicNames && !newErrors.subject && !newErrors.course;
  };

  const handleSaveClick = async () => {
    if (!validateForm()) return;

    const topicsArray = topicNames.split(",").map((name) => name.trim());
    setErrors({ topicNames: "", subject: "", course: "" });

    try {
      const response = await axios.post("/api/updateTopic", {
        topics: topicsArray,
        subjectId :selectedSubject,
        courseId: selectedCourse,
      });
      // {
      //   topics, subjectId, courseId;
      // }
      if (response.status === 200) {
        onTopicAdded(response.data.data);
        setIsTopicAdding(false);
      }
    } catch (error) {
      setErrors({ ...errors, fetch: "Error while saving the topics." });
    }
  };

  const handleCancelClick = () => {
    setIsTopicAdding(false);
  };

  if (loading) return <div>Loading...</div>;
  if (errors.fetch) return <div>{errors.fetch}</div>;

  return (
    <div className="sm:p-6 p-6 mb-4 rounded-lg shadow-lg flex flex-col  gap-4 items-center w-full">
      <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-11/12">
        <div className="relative w-full sm:w-4/5">
          <input
            type="text"
            autoFocus
            value={topicNames}
            placeholder="Enter Topic Names (comma-separated)"
            onChange={(e) => setTopicNames(e.target.value)}
            className="text-lg font-semibold text-gray-800 border-b border-gray-400 outline-none bg-transparent w-full text-center p-2 placeholder:text-sm"
            required
          />
          {errors.topicNames && (
            <p className="text-red-500 text-sm mt-1">{errors.topicNames}</p>
          )}
        </div>

        {!subjectId && (
          <div className="relative w-full sm:w-[180px]">
            <Select
              onValueChange={(value) => setSelectedSubject(value)}
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
              <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
            )}
          </div>
        )}

        {!courseId && (
          <div className="relative w-full sm:w-[180px]">
            <Select
              open={isCourseDropdownOpen}
              onValueChange={(value) => {
                setSelectedCourse(value);
                if (errors.course) {
                  setErrors({ ...errors, course: "" });
                }
              }}
              onOpenChange={(open) => {
                if (!selectedSubject) {
                  setErrors({ ...errors, course: "First select the subject" });
                  return;
                }
                setIsCourseDropdownOpen(open);
                setIsDropdownOpen(open);
              }}
            >
              <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent className="z-50">
                {filteredCourses.length === 0 ? (
                  <div className="text-red-500 p-2">No Courses found</div>
                ) : (
                  filteredCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.courseName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.course && (
              <p className="text-red-500 text-sm mt-1">{errors.course}</p>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center justify-around sm:justify-end gap-7  w-full ">
        <button
          onClick={handleSaveClick}
          className={clsx(
            "flex items-center justify-center text-lg font-semibold  py-3 px-5 border border-transparent rounded-md shadow-sm text-white",
            !topicNames || !selectedSubject || !selectedCourse || !topicNames
              ? "bg-gray-400"
              : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          )}
          disabled={
            !topicNames || !selectedSubject || !selectedCourse || !topicNames
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

export default AddTopicForm;
