"use client";
import Topics from "./Topics";
import { useEffect, useState } from "react";
import api from "@/axios";
import Loader from "@/components/Loader";

export default function Page() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch activity data from the API and send id in body
    // console.log("Fetching activity data for user ID:", user.id);
    api
      .get(
        "/activity",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        // console.log("Activity data fetched:", response.data.data);
        setActivity(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching activity:", error);
      });
  }, []);

  // Check if the data is still loading
  if (loading) {
    return <Loader />;
  }

  if (!activity || activity.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:bg-gray-400 dark:text-white">
        No activity data available.
      </p>
    );
  }

  return (
    <div className="container mx-auto p-4 dark:bg-gray-800">
      {
        // Filter unique courses from the flat JSON data
        activity
          .filter(
            (course, index, self) =>
              self.findIndex((c) => c.courseId === course.courseId) === index
          )
          .map((course, courseIndex) => {
            // Filter topics related to the current course
            const topics = activity.filter(
              (activity) => activity.courseId === course.courseId
            );

            return (
              <div
                key={`course-${courseIndex}`}
                className="mb-8 p-4 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-slate-800"
              >
                <h2 className="text-3xl font-extrabold mb-4 text-blue-600 dark:text-darkBlueText">
                  {course.courseName}
                </h2>
                {topics
                  .sort((a, b) => a.topicIndex - b.topicIndex)
                  .filter(
                    (topic, index, self) =>
                      self.findIndex((t) => t.topicId === topic.topicId) ===
                      index
                  )
                  .map((topic, topicIndex) => {
                    // Filter subtopics for the current topic
                    const topics = activity.filter(
                      (activity) =>
                        activity.courseId === course.courseId &&
                        activity.topicId === topic.topicId
                    );

                    return (
                      <Topics
                        key={`topic-${topicIndex}`}
                        topicIndex={topicIndex}
                        topics={topics} // Pass filtered subtopics
                      />
                    );
                  })}
              </div>
            );
          })
      }
    </div>
  );
}
