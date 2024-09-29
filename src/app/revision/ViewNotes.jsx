"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

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
    <div className="absolute inset-0 top-16 bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">View Notes</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

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
                  href={`/api/files/${encodeURIComponent(note.filePath)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-400 font-semibold transition"
                >
                  View
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
