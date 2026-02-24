"use client";

import { useState, useEffect } from "react";
import MindMap from "./Mindmap";
import api from "@/axios";

export default function MindMapDashboard() {
  const [maps, setMaps] = useState([]);
  const [activeMap, setActiveMap] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------- LOAD ---------- */
  useEffect(() => {
    fetchMaps();
  });

  const fetchMaps = async () => {
    try {
      const res = await api.get("/mindmaps");
      setMaps(res.data);
    } catch (err) {
      console.error("Failed to load mind maps", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- CREATE ---------- */
  const createMap = async () => {
    try {
      const res = await api.post("/mindmaps", {
        title: "Untitled MindMap",
      });

      setMaps((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("Failed to create mind map", err);
    }
  };

  /* ---------- DELETE ---------- */
  const deleteMap = async (id) => {
    try {
      await api.delete(`/mindmaps/${id}`);
      setMaps((prev) => prev.filter((m) => m.id !== id));

      if (activeMap?.id === id) setActiveMap(null);
    } catch (err) {
      console.error("Failed to delete mind map", err);
    }
  };

  /* ---------- VIEW ---------- */
  if (activeMap) {
    return (
      <MindMap
        mapId={activeMap?.id}
        onBack={() => setActiveMap(null)}
      />
    );
  }

  /* ---------- DASHBOARD ---------- */
  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold dark:text-gray-100">Mind Maps</h1>

        <button
          onClick={createMap}
          className="px-4 py-2 rounded bg-blue-500 text-white"
        >
          + New Mind Map
        </button>
      </header>

      {maps.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400">
          No mind maps yet. Create one 🚀
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {maps.map((m) => (
            <div
              key={m.id}
              onClick={() => setActiveMap(m)}
              className="
        cursor-pointer rounded-xl border
        bg-white p-4 shadow-sm
        transition-all duration-200
        hover:shadow-md hover:-translate-y-1

        border-gray-200 text-gray-900
        dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100
      "
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold truncate">{m.title}</h3>

                {/* optional delete button */}
                {/* <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMap(m.id);
                  }}
                  className="
                    text-gray-400 hover:text-red-500
                    dark:text-gray-500 dark:hover:text-red-400
                  "
                >
                  ✕
                </button> */}
              </div>

              {/* optional subtitle / meta */}
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Click to open mind map
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
