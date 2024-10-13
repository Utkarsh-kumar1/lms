
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
//   const [topicNames, setTopicNames] = useState("");
//   const [selectedSubject, setSelectedSubject] = useState(subjectId || null);
//   const [selectedCourse, setSelectedCourse] = useState(courseId || null);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
//   const [subjects, setSubjects] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [filteredCourses, setFilteredCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
  // const [errors, setErrors] = useState({
  //   topicNames: "",
  //   subject: "",
  //   course: "",
  // });

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
//     const newErrors = { topicNames: "", subject: "", course: "" };
//     if (!topicNames) newErrors.topicNames = "Topic Names are required.";
//     if (!selectedSubject) newErrors.subject = "Subject is required.";
//     if (!selectedCourse) newErrors.course = "Course is required.";
//     setErrors(newErrors);
//     return !newErrors.topicNames && !newErrors.subject && !newErrors.course;
//   };

//   const handleSaveClick = async () => {
//     if (!validateForm()) return;

//     const topicsArray = topicNames.split(";").map((name) => name.trim());
//     setErrors({ topicNames: "", subject: "", course: "" });

//     try {
//       const response = await axios.post("/api/updateTopic", {
//         topics: topicsArray,
//         subjectId :selectedSubject,
//         courseId: selectedCourse,
//       });
//       // {
//       //   topics, subjectId, courseId;
//       // }
//       if (response.status === 200) {
//         onTopicAdded(response.data.data);
//         setIsTopicAdding(false);
//       }
//     } catch (error) {
//       setErrors({ ...errors, fetch: "Error while saving the topics." });
//     }
//   };

//   const handleCancelClick = () => {
//     setIsTopicAdding(false);
//   };

//   if (loading) return <div>Loading...</div>;
//   if (errors.fetch) return <div>{errors.fetch}</div>;

//   return (
   
//   );
// };

// export default AddTopicForm;
