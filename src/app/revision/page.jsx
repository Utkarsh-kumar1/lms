"use client";
import api from "@/axios";
import { LoaderCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Topics = dynamic(() => import("./Topics"), {
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
        <LoaderCircle className="animate-spin text-blue-600" size={36} />
      </div>
    </div>
  ),
});

export default function Page() {
  const [revision, setRevision] = useState(null);

  useEffect(() => {
    console.log(
      "filter",
      revision?.filter((course, index, self) => {
        self.findIndex((c) => c.courseId === course.courseId) === index;
      })
    );
    console.log(
      "filter",
      revision?.filter(
        (course, index, self) =>
          self.findIndex((c) => c.courseId === course.courseId) === index
      )
    );
  }, [revision]);

  useEffect(() => {
    api
      .get("/revision", {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log("Revision data fetched:", response.data.data);
        setRevision(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching revision:", error);
      });
  }, []);

  if (!revision || revision.length <= 0)
    return (
      <p className="text-center text-gray-500">No Revision data available.</p>
    );
  return (
    <div className="container mx-auto p-4  dark:bg-gray-800">
      {revision
        ?.filter(
          (course, index, self) =>
            self.findIndex((c) => c.courseId === course.courseId) === index
        )
        .map((course, courseIndex) => {
          // Filter topics related to the current course
          const topics = revision.filter(
            (revision) => revision.courseId === course.courseId
          );

          return (
            <div
              key={`course-${courseIndex}`}
              className="mb-8 p-4 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800  "
            >
              <h2 className="text-3xl font-extrabold mb-4 text-blue-600 dark:text-darkBlueText  ">
                {course.courseName}
              </h2>
              {topics
                ?.sort((a, b) => a.topicIndex - b.topicIndex)
                .filter(
                  (topic, index, self) =>
                    self.findIndex((t) => t.topicId === topic.topicId) === index
                )
                .map((topic, topicIndex) => {
                  // Filter subtopics for the current topic
                  const topics = revision?.filter(
                    (revision) =>
                      revision.courseId === course.courseId &&
                      revision.topicId === topic.topicId
                  );
                  console.log("logging topics", topics);

                  return (
                    <Topics
                      key={topicIndex}
                      topics={topics}
                      topicIndex={topicIndex}
                    />
                  );
                })}
            </div>
          );
        })}
    </div>
  );
}
