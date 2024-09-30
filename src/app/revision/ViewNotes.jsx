"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import PdfViewer from "@/components/PdfViewer";
import axios from "axios";

function ViewNotes({ isOpen, topicId, setIsOpen }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && topicId) {
      const fetchNotes = async () => {
        try {
          const response = await axios.get("/api/topic/notes", {
            params: { topicId: topicId },
          });
          // console.log(response.data.data);

          setNotes(JSON.parse(response.data.data));
        } catch (error) {
          console.error("Error fetching notes:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchNotes();
    }
  }, [isOpen, topicId]);

  if (!isOpen) return null;

  return (
    <div className=" inset-0 top-16 bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
      {loading ? (
        <p className="text-gray-600">Loading notes...</p>
      ) : notes.length > 0 ? (
        <ul className="space-y-4">
          {notes.map((note, index) => (
            <li
              key={index}
              className="bg-gray-100 p-4 rounded-lg shadow-md transition hover:bg-gray-200"
            >
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-800">
                  {note.fileName}
                </span>

                <a
                  href={`/api/topic/${encodeURIComponent(
                    topicId
                  )}/files/${encodeURIComponent(note.filePath)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-400 font-semibold transition"
                >
                  Open
                </a>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No notes available.</p>
      )}
    </div>
  );
}

export default ViewNotes;
