"use client";

import { useEffect, useState } from "react";

export default function MindMapTopBar({
  title,
  onTitleChange,
  onBack,
  saveStatus,
  versions = [],
  loadVersions,
  onRestoreVersion,
}) {
  const [editing, setEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [localTitle, setLocalTitle] = useState(title || "");

  useEffect(() => {
    setLocalTitle(title || "");
  }, [title]);

  const commitTitle = () => {
    if (localTitle !== title) {
      onTitleChange(localTitle);
    }
    setEditing(false);
  };

  return (
    <div
      className="
        absolute top-4 left-40 -translate-x-1/2 z-50
        flex items-center gap-4 px-4 py-2 rounded-xl
        bg-white/90 dark:bg-gray-800/90
        backdrop-blur border border-gray-200 dark:border-gray-700
        shadow-lg pointer-events-auto select-none
      "
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* BACK */}
      <button
        onClick={onBack}
        className="text-lg font-bold px-2 text-gray-700 dark:text-gray-300"
      >
        ←
      </button>

      {/* TITLE */}
      {editing ? (
        <input
          autoFocus
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitTitle();
            }
            if (e.key === "Escape") {
              setLocalTitle(title);
              setEditing(false);
            }
          }}
          onBlur={commitTitle}
          className="
            bg-transparent outline-none font-semibold
            text-gray-900 dark:text-gray-100
            border-b border-gray-400 dark:border-gray-500
          "
        />
      ) : (
        <div
          onDoubleClick={() => setEditing(true)}
          className="font-semibold cursor-text text-gray-900 dark:text-gray-100"
        >
          {title}
        </div>
      )}

      {/* SAVE STATUS */}
      <div className="text-sm">
        {saveStatus === "saving" && (
          <span className="text-yellow-500">● Saving…</span>
        )}
        {saveStatus === "saved" && (
          <span className="text-green-500">● Saved</span>
        )}
        {saveStatus === "error" && (
          <span className="text-red-500">● Error</span>
        )}
      </div>

      {/* VERSION HISTORY */}
      <div className="relative">
        <button
          onClick={async () => {
            if (!showHistory) await loadVersions();
            setShowHistory((v) => !v);
          }}
          className="px-2 text-gray-600 dark:text-gray-400"
        >
          ⏱
        </button>

        {showHistory && (
          <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-gray-900 border shadow-xl">
            {versions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">No history yet</div>
            ) : (
              versions.map((v) => (
                <button
                  key={v.version}
                  onClick={() => {
                    onRestoreVersion(v.version);
                    setShowHistory(false);
                  }}
                  className="w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Saved
                  <div className="text-xs text-gray-500">
                    {new Date(v.created_at).toLocaleString()}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
