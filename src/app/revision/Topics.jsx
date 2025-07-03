"use client";
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
import React, { useState } from "react";
import { NotebookPen } from "lucide-react";
import ViewNotes from "./ViewNotes";

function Topics({ topics, topicIndex }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log("Topic Name from Accordian", topics, topicIndex);

  return (
    <>
      <Accordion
        type="single"
        collapsible
        // key={`accordion-${topicIndex}`}
        className="mb-4"
      >
        <AccordionItem
          value={`item-${topicIndex}`}
          className="border rounded-lg "
        >
          {/* Styled Accordion Trigger */}
          <AccordionTrigger className="bg-blue-500 text-white p-4 rounded-t-lg hover:bg-blue-600 transition duration-150 ease-in-out flex justify-between items-center dark:bg-darkBlue ">
            {/* Topic Name */}
            <span className=" text-wrap text-left    ">
              {topics[0]?.topicIndex + ". " + topics[0]?.topicName}
            </span>

            {/* View Notes button with icon */}
            <div
              className={`flex items-center gap-1 hover:bg-blue-400 py-1 px-2 rounded-md cursor-pointer transition duration-150 ml-auto mr-4 ${
                isModalOpen && "bg-blue-400"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(!isModalOpen);
              }}
            >
              <NotebookPen className="text-white" />
              <p className="text-sm text-white ">Notes</p>
            </div>
          </AccordionTrigger>
          {/* Modal for viewing notes */}
          {isModalOpen && (
            <ViewNotes isOpen={isModalOpen} notes={topics.notes} />
          )}

          {/* Accordion Content */}
          <AccordionContent className="bg-gray-100 sm:p-4 rounded-b-lg p-0 dark:bg-gray-600">
            <Table className="w-full">
              <TableHeader className="dark:bg-gray-500">
                <TableRow>
                  <TableHead className="font-bold text-[.7rem]">
                    SubTopic
                  </TableHead>
                  <TableHead className="font-bold text-[.7rem]">
                    Created At
                  </TableHead>
                  <TableHead className="font-bold text-[.7rem] text-center">
                    Revision Counter
                  </TableHead>
                  <TableHead className="font-bold text-[.7rem]">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics ?.sort((a, b) => a.subtopicIndex - b.subtopicIndex)
                .map((subtopic, subIndex) => (
                  <DataRow key={subIndex} subtopic={subtopic} />
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}

export default Topics;
