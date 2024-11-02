"use client"; // Ensure the component runs on the client side

import React, { useEffect, useState } from "react";
import { FilePenLine, FilePlus2, NotebookPen } from "lucide-react"; // Import the FilePlus2 icon from lucide-react
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
import FileUploadModal from "./FileUploadModal";
import clsx from "clsx";
import axios from "axios";
function Topics({ topicIndex, topics }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFileViewOpen, setIsFileViewOpen] = useState(false);
  const [notes, setNotes] = useState(null);

  useEffect(() => {
    const fetchNotes = async() => {
      const {
        data: { data },
      } = await axios.get(`/api/notesInActivity?topic=${topics[0].topicId}`)
      setNotes(data);
    };
    fetchNotes();

    
  }, []);

  return (
    <Accordion
      type="single"
      collapsible
      key={`accordion-${topicIndex}`}
      className="mb-4"
    >
      <AccordionItem value={`item-${topicIndex}`} className="border rounded-lg">
        <AccordionTrigger className="bg-blue-500 text-white p-4 rounded-t-lg hover:bg-blue-600 transition duration-150 ease-in-out shadow-md flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg dark:bg-darkBlue">
          <span>{topics[0].topicIndex + ". " + topics[0].topicName}</span>

          <div className="flex items-center gap-4 ml-auto mr-4">
            <FilePlus2
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className="cursor-pointer text-white hover:text-gray-200 transition duration-150 ease-in-out"
              size={24}
            />

            <NotebookPen
              onClick={(e) => {
                e.preventDefault();
                setIsFileViewOpen((prev) => !prev);
              }}
            />
          </div>
        </AccordionTrigger>
        <div
          className={clsx(
            " rounded-b-lg bg-gray-300 p-4  transition-max-height duration-700 ease-in-out w-full overflow-hidden",
            isFileViewOpen
              ? " flex max-h-96 opacity-100"
              : " hidden max-h-0 opacity-0"
          )}
        >
          {notes?.length > 0 ? (
            <div className="mt-2 transition-max-height duration-700 ease-in-out w-full ">
              <p className="text-sm font-semibold">Notes:</p>
              <ul className=" text-sm text-gray-700 w-full">
                {notes?.map((notes, idx) => (
                  <li
                    key={idx}
                    className="max-w-full truncate"
                    title={notes.notesFilename}
                  >
                    <a
                      href={`api/files/${notes.notesFilePath}`}
                      target="_blank"
                      className="text-blue-600 underline"
                      rel="noopener noreferrer"
                    >
                      {notes.notesFilename}
                    </a>
                    <p className="flex flex-col w-full text-wrap ml-3">
                      <span className="font-bold"> Uploaded At : </span>
                      {new Date(notes.notesCreatedAt)
                        .toString()
                        .replace("GMT+0530 (India Standard Time)", "")}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No Notes Found</p>
          )}
        </div>

        <AccordionContent className="bg-gray-100 sm:p-4 p-2 rounded-b-lg dark:bg-gray-600 ">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="dark:text-white">
                <TableHead className="font-bold text-[.7rem] dark:text-white ">
                  SubTopic
                </TableHead>
                <TableHead className="font-bold text-[.7rem] dark:text-white">
                  Created At
                </TableHead>
                <TableHead className="font-bold text-[.7rem] dark:text-white">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Render each subtopic using DataRow */}
              {topics?.map((subtopic, subIndex) => (
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

      {/* File Upload Modal */}

      <FileUploadModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        courseId={topics[0].courseId}
        subjectId={topics[0].subjectId}
        topicId={topics[0].topicId}
      />
    </Accordion>
  );
}

export default Topics;
