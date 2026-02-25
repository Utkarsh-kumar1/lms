"use client";

import api from "@/axios";
import { useEffect, useRef, useState } from "react";
import MindMapTopBar from "./MindMapTopBar";

const MIN_FONT = 12;
const MAX_FONT = 16;
const MAX_WIDTH = 220;

const START_OFFSET_Y = 120;
const NODE_WIDTH = 60;
const NODE_HEIGHT = 40;
const GAP_X = 180;
const GAP_Y = 80;

const getFontSize = (text) => {
  if (text.length < 20) return MAX_FONT;
  if (text.length > 80) return MIN_FONT;

  const ratio = (80 - text.length) / 60;
  return MIN_FONT + ratio * (MAX_FONT - MIN_FONT);
};

export default function MindMap({ mapId, onBack }) {
  const containerRef = useRef(null);
  const saveTimer = useRef(null);
  const hasLoaded = useRef(false);
  const lastSaved = useRef("");
  const [editingId, setEditingId] = useState(null);

  const nodeRefs = useRef({});
  const [nodeSizes, setNodeSizes] = useState({});

  /* ---------- PAN & ZOOM (refs, not state) ---------- */
  const panRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const isPanning = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const [, forceRender] = useState(0);

  /* ---------- DATA ---------- */
  const [startOffsetX, setStartOffsetX] = useState(300);
  const [title, setTitle] = useState();
  const [nodes, setNodes] = useState([]);
  const [positions, setPositions] = useState({});
  const [versions, setVersions] = useState([]);
  const [saveStatus, setSaveStatus] = useState("saved");
  // "saving" | "saved" | "error"
  useEffect(() => {
    setStartOffsetX(window.innerWidth / 4);
  }, []);

  const loadVersions = async () => {
    const { data } = await api.get(`/mindmaps/${mapId}/versions`);
    setVersions(data);
  };

  const restoreVersion = async (version) => {
    try {
      const { data } = await api.post(`/mindmaps/${mapId}/restore/${version}`);

      hasLoaded.current = false; // 🚫 avoid autosave loop
      setNodes(data?.nodes_json?.nodes);
      hasLoaded.current = true;
    } catch (e) {
      console.error(e.toString);
    }
  };

  const updateTitle = async (newTitle) => {
    try {
      await api.put(`/mindmaps/setTitle/${mapId}`, { newTitle });
      setTitle(newTitle);
    } catch (e) {
      setTitle(title);
      console.error(e.toString);
    }
  };

  // Fetch at start
  useEffect(() => {
    if (!mapId) return;

    (async () => {
      try {
        const { data } = await api.get(`/mindmaps/${mapId}`);
        const fullJsonData = data?.nodes_json ?? [];
        setTitle(data?.title);
        setNodes(fullJsonData?.nodes);

        // ✅ mark this state as already saved
        lastSaved.current = JSON.stringify(fullJsonData?.nodes);

        // ✅ now allow autosave
        hasLoaded.current = true;
      } catch (err) {
        console.error("Failed to load mindmap", err);
      }
    })();

    // Load versions
    loadVersions();
  }, [mapId]);

  // Update mindmap with debounce timer
  useEffect(() => {
    if (!hasLoaded.current) return;
    if (!mapId || nodes?.length === 0) return;

    const current = JSON.stringify(nodes);
    if (current === lastSaved.current) return;

    lastSaved.current = current;
    setSaveStatus("saving");

    clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
      try {
        await api.put(`/mindmaps/${mapId}`, { nodes });
        setSaveStatus("saved");
        loadVersions(); // 🔥 refresh history
      } catch {
        setSaveStatus("error");
      }
    }, 4000);
  }, [nodes]);

  /* ---------- POINTER PAN ---------- */
  const onPointerDown = (e) => {
    // 🚫 If clicking a button or node UI — do NOT pan
    if (e.target.closest("button")) return;

    if (e.button !== 0) return;

    isPanning.current = true;
    last.current = { x: e.clientX, y: e.clientY };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isPanning.current) return;

    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;

    panRef.current.x += dx;
    panRef.current.y += dy;

    last.current = { x: e.clientX, y: e.clientY };
    forceRender((v) => v + 1);
  };

  const onPointerUp = (e) => {
    isPanning.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  /* ---------- WHEEL ZOOM ---------- */
  const onWheel = (e) => {
    e.preventDefault();

    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(Math.max(scaleRef.current * zoom, 0.3), 2.5);

    const rect = containerRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    panRef.current.x =
      cx - ((cx - panRef.current.x) * newScale) / scaleRef.current;
    panRef.current.y =
      cy - ((cy - panRef.current.y) * newScale) / scaleRef.current;

    scaleRef.current = newScale;
    forceRender((v) => v + 1);
  };

  /* ---------- TREE LAYOUT ---------- */
  const buildTree = (flat) => {
    const map = {};
    flat?.forEach((n) => (map[n.id] = { ...n, children: [] }));
    flat?.forEach((n) => {
      if (n.parentId) map[n.parentId].children.push(map[n.id]);
    });
    return map[flat?.find((n) => n.parentId === null)?.id];
  };

  useEffect(() => {
    const tree = buildTree(nodes);
    if (!tree) return;

    const pos = {};
    let currentY = 0;

    const dfs = (node, depth) => {
      if (node.children.length === 0) {
        pos[node.id] = {
          x: depth * GAP_X + startOffsetX,
          y: currentY + START_OFFSET_Y,
        };
        currentY += NODE_HEIGHT + GAP_Y;
        // const nodeHeight = nodeSizes[node.id]?.height ?? NODE_HEIGHT;
        // currentY += nodeHeight + GAP_Y;
        return;
      }

      node.children.forEach((c) => dfs(c, depth + 1));

      const first = pos[node.children[0].id];
      const last = pos[node.children[node.children.length - 1].id];

      pos[node.id] = {
        x: depth * GAP_X + startOffsetX,
        y: (first.y + last.y) / 2,
      };
    };

    dfs(tree, 0);
    setPositions(pos);
  }, [nodes, startOffsetX]);

  useEffect(() => {
    const sizes = {};

    Object.entries(nodeRefs.current).forEach(([id, el]) => {
      if (!el) return;

      const rect = el.getBoundingClientRect();

      sizes[id] = {
        width: rect.width / scaleRef.current,
        height: rect.height / scaleRef.current,
      };
    });

    setNodeSizes(sizes);
  }, [nodes, editingId, scaleRef.current]);

  /* ---------- ACTIONS ---------- */
  const addNode = (parentId) => {
    setNodes((prev) => [
      ...prev,
      { id: Date.now().toString(), text: "New", parentId },
    ]);
  };

  const deleteNode = (id) => {
    const ids = new Set();
    const collect = (pid) => {
      ids.add(pid);
      nodes?.filter((n) => n.parentId === pid).forEach((c) => collect(c.id));
    };
    collect(id);
    setNodes((prev) => prev.filter((n) => !ids.has(n.id)));
  };

  /* ---------- CONTENT SIZE ---------- */
  const width =
    Math.max(...Object.values(positions).map((p) => p.x || 0), 0) +
    NODE_WIDTH +
    300;
  const height =
    Math.max(...Object.values(positions).map((p) => p.y || 0), 0) +
    NODE_HEIGHT +
    300;

  /* ---------- RENDER ---------- */
  return (
    <div
      ref={containerRef}
      className="
          relative w-full h-full overflow-hidden
          bg-gray-100 dark:bg-gray-900
        "
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
    >
      {/* 🔝 FLOATING UI */}
      <MindMapTopBar
        title={title}
        onTitleChange={updateTitle}
        onBack={onBack}
        saveStatus={saveStatus}
        versions={versions}
        onRestoreVersion={restoreVersion}
      />
      <div
        style={{
          transform: `translate(${panRef.current.x}px, ${panRef.current.y}px)
                      scale(${scaleRef.current})`,
          transformOrigin: "0 0",
        }}
      >
        <svg
          width={width}
          height={height}
          className="absolute top-0 left-0 pointer-events-none"
        >
          {nodes?.map((n) => {
            if (!n.parentId) return null;
            const p = positions[n.parentId];
            const c = positions[n.id];
            if (!p || !c) return null;

            return (
              <path
                key={n.id}
                d={`
                  M ${p.x + (nodeSizes[n.parentId]?.width ?? NODE_WIDTH)}
                    ${p.y + (nodeSizes[n.parentId]?.height ?? NODE_HEIGHT) / 2}

                  C ${p.x + (nodeSizes[n.parentId]?.width ?? NODE_WIDTH) + 40}
                    ${p.y + (nodeSizes[n.parentId]?.height ?? NODE_HEIGHT) / 2},
                    ${c.x - 40}
                    ${c.y + (nodeSizes[n.id]?.height ?? NODE_HEIGHT) / 2},
                    ${c.x}
                    ${c.y + (nodeSizes[n.id]?.height ?? NODE_HEIGHT) / 2}
                `}
                stroke="currentColor"
                className="text-gray-400 dark:text-gray-500"
                fill="none"
                strokeWidth="2"
              />
            );
          })}
        </svg>

        {nodes?.map((n) => {
          const p = positions[n.id];
          if (!p) return null;

          const fontSize = getFontSize(n.text);

          return (
            <div
              ref={(el) => (nodeRefs.current[n.id] = el)}
              key={n.id}
              onPointerDown={(e) => e.stopPropagation()}
              className="
                group absolute rounded-xl border px-3 py-2 select-none
                bg-white text-gray-900 border-gray-300 shadow
                dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:shadow-[0_4px_12px_rgba(0,0,0,0.6)]
              "
              style={{
                left: p.x,
                top: p.y,
                maxWidth: MAX_WIDTH,
                fontSize,
              }}
            >
              {editingId === n.id ? (
                <textarea
                  autoFocus
                  value={n.text}
                  onChange={(e) =>
                    setNodes((prev) =>
                      prev.map((node) =>
                        node.id === n.id
                          ? { ...node, text: e.target.value }
                          : node,
                      ),
                    )
                  }
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      setEditingId(null);
                    }
                  }}
                  className="
                    w-full resize-none bg-transparent outline-none
                    text-center leading-snug
                    text-gray-900 dark:text-gray-100
                  "
                />
              ) : (
                <div
                  className="text-center break-words cursor-text"
                  onDoubleClick={() => setEditingId(n.id)}
                >
                  {n.text}
                </div>
              )}

              {/* ADD */}
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => addNode(n.id)}
                className="
                  absolute -right-3 top-1/2 -translate-y-1/2
                  w-6 h-6 rounded-full text-sm
                  bg-blue-500 hover:bg-blue-600 text-white
                  opacity-0 group-hover:opacity-100 transition
                "
              >
                +
              </button>

              {/* DELETE */}
              {n.parentId && (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => deleteNode(n.id)}
                  className="
                    absolute -bottom-3 left-1/2 -translate-x-1/2
                    w-6 h-6 rounded-full text-sm
                    bg-red-500 hover:bg-red-600 text-white
                    opacity-0 group-hover:opacity-100 transition
                  "
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
