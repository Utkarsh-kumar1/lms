"use client"

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

function Topics({ topic: initialTopic , topicIndex }) {
  const [topic, setTopic] = useState(initialTopic);

  
    function onsubtopicUpdate(data) {
      const updatedSubtopics = topic.subtopics?.map((subtopic) => {
        if (subtopic.id === data.id) {
          // Update the matching subtopic
          return {
            ...subtopic,
            ...data,
          };
        }
        return subtopic;
      });

      // Update the topic with the new subtopics
      setTopic({
        ...topic,
        subtopics: updatedSubtopics,
      });
    }
  return (
    <Accordion
      type="single"
      collapsible
      key={`accordion-${topicIndex}`}
      className="mb-4"
    >
      <AccordionItem value={`item-${topicIndex}`} className="border rounded-lg">
        <AccordionTrigger className="bg-blue-500 text-white p-4 rounded-t-lg hover:bg-blue-600 transition duration-150">
          {topic.topicName}
        </AccordionTrigger>
        <AccordionContent className="bg-gray-100 sm:p-4 rounded-b-lg p-0">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-[.7rem]">
                  SubTopic
                </TableHead>
                <TableHead className="font-bold text-[.7rem]">Start</TableHead>
                <TableHead className="font-bold text-[.7rem]">End</TableHead>
                <TableHead className="font-bold text-[.7rem]">
                  Revision Counter
                </TableHead>
                <TableHead className="font-bold text-[.7rem]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topic.subtopics?.map((subtopic, subIndex) => (
                <DataRow
                  key={subIndex}
                  subtopic={subtopic}
                  subIndex={subIndex}
                  onsubtopicUpdate = {onsubtopicUpdate}
                />
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default Topics;
