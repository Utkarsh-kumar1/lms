"use client";

import React, { Suspense, useEffect, useState } from "react";
import { TrendingUp, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const PieChartComponent = dynamic(
  () => import("@/components/PieChartComponent"),
  {
    suspense: true,
  }
);

const calculateStats = (data) => {
  let totalSubjects = 0;
  let totalCourses = 0;
  let totalTopics = 0;
  let totalSubtopics = 0;
  let subjectsCompleted = 0;
  let subjectsNotCompleted = 0;
  let coursesCompleted = 0;
  let coursesNotCompleted = 0;
  let topicsCompleted = 0;
  let topicsNotCompleted = 0;
  let subtopicsCompleted = 0;
  let subtopicsNotCompleted = 0;

  data.forEach((subject) => {
    totalSubjects++;
    if (subject.isCompleted === 1) {
      subjectsCompleted++;
    } else {
      subjectsNotCompleted++;
    }
    subject.courses.forEach((course) => {
      totalCourses++;
      if (course.isCompleted === 1) {
        coursesCompleted++;
      } else {
        coursesNotCompleted++;
      }
      course.topics.forEach((topic) => {
        totalTopics++;
        if (topic.isCompleted === 1) {
          topicsCompleted++;
        } else {
          topicsNotCompleted++;
        }
        topic.subTopics.forEach((subtopic) => {
          totalSubtopics++;
          if (subtopic.isCompleted === 1) {
            subtopicsCompleted++;
          } else {
            subtopicsNotCompleted++;
          }
        });
      });
    });
  });

  return {
    subjectsCompleted,
    subjectsNotCompleted,
    coursesCompleted,
    coursesNotCompleted,
    topicsCompleted,
    topicsNotCompleted,
    subtopicsCompleted,
    subtopicsNotCompleted,
    totalSubjects,
    totalCourses,
    totalSubtopics,
    totalTopics,
  };
};

export default function StatisticsDashboard({ userData }) {
  const [data, setData] = useState({
    totalSubjects: 0,
    totalCourses: 0,
    totalTopics: 0,
    totalSubtopics: 0,
    completedSubjects: 0,
    notCompletedSubjects: 0,
    completedCourses: 0,
    notCompletedCourses: 0,
    completedTopics: 0,
    notCompletedTopics: 0,
    completedSubtopics: 0,
    notCompletedSubtopics: 0,
  });

  useEffect(() => {
    const processedData = calculateStats(userData);
    setData({
      totalSubjects: processedData.totalSubjects,
      totalCourses: processedData.totalCourses,
      totalTopics: processedData.totalTopics,
      totalSubtopics: processedData.totalSubtopics,
      completedSubjects: processedData.subjectsCompleted,
      notCompletedSubjects: processedData.subjectsNotCompleted,
      completedCourses: processedData.coursesCompleted,
      notCompletedCourses: processedData.coursesNotCompleted,
      completedTopics: processedData.topicsCompleted,
      notCompletedTopics: processedData.topicsNotCompleted,
      completedSubtopics: processedData.subtopicsCompleted,
      notCompletedSubtopics: processedData.subtopicsNotCompleted,
    });
  }, [userData]);

  const subjectData = [
    {
      name: "Completed Subjects",
      value: data.completedSubjects,
      fill: "green",
    },
    {
      name: "Not Completed Subjects",
      value: data.notCompletedSubjects,
      fill: "red",
    },
  ];

  const courseData = [
    { name: "Completed Courses", value: data.completedCourses, fill: "green" },
    {
      name: "Not Completed Courses",
      value: data.notCompletedCourses,
      fill: "red",
    },
  ];

  const topicData = [
    { name: "Completed Topics", value: data.completedTopics, fill: "green" },
    {
      name: "Not Completed Topics",
      value: data.notCompletedTopics,
      fill: "red",
    },
  ];

  const subtopicData = [
    {
      name: "Completed Subtopics",
      value: data.completedSubtopics,
      fill: "green",
    },
    {
      name: "Not Completed Subtopics",
      value: data.notCompletedSubtopics,
      fill: "red",
    },
  ];

  return (
    <div className="flex flex-wrap gap-4 p-4 min-h-60 w-full">
      <Card className="flex-1 min-h-[200px]  min-w-[160px] max-w-[400px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-serif text-2xl font-medium">
            Subjects
          </CardTitle>
        </CardHeader >
        <CardContent >
          <PieChartComponent data={subjectData} title="Subjects" />
        </CardContent>
      </Card>
      <Card className="flex-1 min-h-[200px] min-w-[160px] max-w-[400px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-serif font-medium">
            Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PieChartComponent data={courseData} title="Courses" />
        </CardContent>
      </Card>
      <Card className="flex-1 min-h-[200px] min-w-[160px] max-w-[400px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-serif font-medium">
            Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PieChartComponent data={topicData} title="Topics" />
        </CardContent>
      </Card>
      <Card className="flex-1 min-h-[200px] min-w-[160px] max-w-[400px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-serif font-medium">
            Subtopics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PieChartComponent data={subtopicData} title="Subtopics" />
        </CardContent>
      </Card>
    </div>
  );
}
