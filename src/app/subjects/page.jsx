import { authOptions } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { db } from "@/db/drizzle";
import dynamic from "next/dynamic";
import { LoaderCircle } from "lucide-react";
const SubjectContent = dynamic(() => import("./SubjectContent"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
        <LoaderCircle className="animate-spin text-blue-600" size={36} />
      </div>
    </div>
  ),
});

async function fetchSubject(id) {
  try {
    const subjects = await db.query.subject.findMany({
      with: {
        notes: true,
      },
      where: (subject, { eq }) => eq(subject.owner, id),
      orderBy: (subject, { asc }) => [asc(subject.subjectName)],
    });

    return subjects;
  } catch (error) {
    throw new Error("Error while fetching Data");
  }
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  let subjects = null;
  try {
    subjects = await fetchSubject(session.id);
  } catch (error) {
    return <div>{error.message}</div>;
  }

  return <SubjectContent subjects={subjects} />;
}
