"use client"; // Ensure the component runs on the client side

import React, { useState } from "react";
import { FilePenLine, FilePlus2 } from "lucide-react"; // Import the FilePlus2 icon from lucide-react
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Table components
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"; // Accordion components
import DataRow from "./DataRow"; // Import DataRow for rendering subtopics
import FileUploadModal from "./FileUploadModal"; // Import your file upload modal

function Topics({ topic: initialTopic, topicIndex, courseId }) {
  const [topic, setTopic] = useState(initialTopic); // State to manage the topic and its subtopics
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state

  // Function to update subtopics after a change
  function onsubtopicUpdate(data) {
    const updatedSubtopics = topic.subtopics?.map((subtopic) => {
      if (subtopic.id === data.id) {
        return {
          ...subtopic,
          ...data,
        };
      }
      return subtopic;
    });

    setTopic({
      ...topic,
      subtopics: updatedSubtopics,
    });
  }

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Handle successful file upload
  const handleFileUpload = () => {
    console.log("File uploaded successfully");
  };

  return (
    <Accordion
      type="single"
      collapsible
      key={`accordion-${topicIndex}`}
      className="mb-4" // Add margin for better spacing
    >
      <AccordionItem value={`item-${topicIndex}`} className="border rounded-lg">
        <AccordionTrigger className="bg-blue-500 text-white p-4 rounded-t-lg hover:bg-blue-600 transition duration-150 ease-in-out shadow-md flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-300">
          {/* Topic name */}
          <span>{topic.topicName}</span>

          {/* FilePlus2 icon button to trigger the modal */}
          <div className="flex items-center gap-4 ml-auto mr-4">
            {" "}
            {/* Add ml-auto to push icons to the right */}
            <FilePlus2
              onClick={(e) => {
                e.stopPropagation(); // Prevent the accordion from collapsing
                setIsModalOpen(true); // Open the modal
              }}
              className="cursor-pointer text-white hover:text-gray-200 transition duration-150 ease-in-out"
              size={24} // Adjust size of the icon
            />
            <FilePenLine
              className="text-white hover:text-gray-200 transition duration-150 ease-in-out"
              size={24}
            />
          </div>
        </AccordionTrigger>

        <AccordionContent className="bg-gray-100 sm:p-4 p-2 rounded-b-lg">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-[.7rem]">
                  SubTopic
                </TableHead>
                <TableHead className="font-bold text-[.7rem]">Start</TableHead>
                <TableHead className="font-bold text-[.7rem]">End</TableHead>
                <TableHead className="font-bold text-[.7rem]">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Render each subtopic using DataRow */}
              {topic.subtopics?.map((subtopic, subIndex) => (
                <DataRow
                  key={subIndex}
                  subtopic={subtopic}
                  subIndex={subIndex}
                  onsubtopicUpdate={onsubtopicUpdate}
                />
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>

      {/* File Upload Modal */}
      {isModalOpen && (
        <FileUploadModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onFileUpload={handleFileUpload}
          typeId={topic.topicId}
          type={"topic"}
          courseId={courseId}
        />
      )}
    </Accordion>
  );
}

export default Topics;
