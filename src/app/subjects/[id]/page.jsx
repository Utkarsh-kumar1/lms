import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/db/drizzle";
import dynamic from "next/dynamic";
import { LoaderCircle } from "lucide-react";
const CourseContent = dynamic(() => import("@/app/courses/CourseContent"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
        <LoaderCircle className="animate-spin text-blue-600" size={36} />
      </div>
    </div>
  ),
});
const SubjectCard = dynamic(() => import("../SubjectCard"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
        <LoaderCircle className="animate-spin text-blue-600" size={36} />
      </div>
    </div>
  ),
});

async function fetchSubject(owner, subjectId) {
  try {
    const subjects = await db.query.subject.findMany({
      with: {
        courses: {
          with: {
            notes: true,
          },
        },
      },
      where: (subject, { eq, and }) =>
        and(eq(subject.id, subjectId), eq(subject.owner, owner)),
    });

    return subjects;
  } catch (error) {
    throw new Error("Error while fetching Data");
  }
}

export default async function page({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <div>Unauthorized Access</div>;
  }
  try {
    const subjects = await fetchSubject(session.id, params.id);
    if (subjects.length === 0) {
      return <div>No subjects Found</div>;
    }

    return (
      <>
        <SubjectCard subject={subjects[0]} />
        <CourseContent subjects={subjects} isShowSubjectName={false} />
      </>
    );
  } catch (error) {
    return (
      <div>
        {" "}
        {error.message ? error.message : "Error while Fetching the data"}{" "}
      </div>
    );
  }
}
