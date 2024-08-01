import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/options";
import dbconnect from "@/lib/dbconnect";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import DataRow from "./DataRow";

async function fetchActivity(id) {
  const pool = dbconnect();
  const [data] = await pool.execute(
    "SELECT courseName, topics FROM activityView WHERE userId = ?",
    [id]
  );
  return data;
}

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
    return null;
  }

  const activity = await fetchActivity(session.id);

  if (!activity || activity.length === 0) {
    return (
      <p className="text-center text-gray-500">No activity data available.</p>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {activity.map((course, courseIndex) => {
        const topics = JSON.parse(course.topics);
        return (
          <div
            key={`course-${courseIndex}`}
            className="mb-8 p-4 bg-white border border-gray-200 rounded-lg shadow-md"
          >
            <h2 className="text-3xl font-extrabold mb-4 text-blue-600">
              {course.courseName.charAt(0).toUpperCase() +
                course.courseName.slice(1).toLowerCase()}
            </h2>
            {topics.map((topic, topicIndex) => (
              <Accordion
                type="single"
                collapsible
                key={`accordion-${courseIndex}-${topicIndex}`}
                className="mb-4"
              >
                <AccordionItem
                  value={`item-${topicIndex}`}
                  className="border rounded-lg"
                >
                  <AccordionTrigger className="bg-blue-500 text-white p-4 rounded-t-lg hover:bg-blue-600 transition duration-150">
                    {topic.topicName}
                  </AccordionTrigger>
                  <AccordionContent className="bg-gray-100 sm:p-4  rounded-b-lg p-0">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-bold text-[.7rem]">
                            SubTopic
                          </TableHead>
                          <TableHead className="font-bold text-[.7rem]">
                            Start
                          </TableHead>
                          <TableHead className="font-bold text-[.7rem]">
                            End
                          </TableHead>
                          <TableHead className="font-bold text-[.7rem]">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topic.subtopics.map((subtopic, subIndex) => (
                          <DataRow
                            key={subIndex}
                            subtopic={subtopic}
                            subIndex={subIndex}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        );
      })}
    </div>
  );
}
