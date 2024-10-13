"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

function ViewNotes({ isOpen, notes }) {

  if (!isOpen) return null;

  if (!notes) {
    return (
      <div className=" inset-0 top-16 bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
        <p className="text-gray-600">No notes available.</p>
      </div>
    );
  }

  return (
    <div className=" inset-0 top-16 bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
      {notes.length > 0 ? (
        <ul className="space-y-4">
          {notes.map((note, index) => (
            <li
              key={index}
              className="bg-gray-100 p-4 rounded-lg shadow-md transition hover:bg-gray-200"
            >
              <div className="flex justify-between items-center">
                <span className="sm:text-lg font-medium text-gray-800 text-wrap text-xs">
                  {note.fileName}
                </span>

                <a
                  href={`/api/files/${encodeURIComponent(
                    note.filePath)}`}
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
