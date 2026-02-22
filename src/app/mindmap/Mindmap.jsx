"use client";

import { useEffect, useRef, useState } from "react";

const START_OFFSET_Y = 120;
const NODE_WIDTH = 140;
const NODE_HEIGHT = 60;
const GAP_X = 180;
const GAP_Y = 80;

export default function MindMap() {
  const containerRef = useRef(null);

  /* ---------- PAN & ZOOM (refs, not state) ---------- */
  const panRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const isPanning = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const [, forceRender] = useState(0);

  /* ---------- DATA ---------- */
  const [startOffsetX, setStartOffsetX] = useState(300);
  const [nodes, setNodes] = useState([
    { id: "1", text: "Start", parentId: null },
    { id: "2", text: "Child 1", parentId: "1" },
    { id: "3", text: "Child 2", parentId: "1" },
  ]);
  const [positions, setPositions] = useState({});

  useEffect(() => {
    setStartOffsetX(window.innerWidth / 4);
  }, []);

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
    const newScale = Math.min(
      Math.max(scaleRef.current * zoom, 0.3),
      2.5
    );

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
    flat.forEach((n) => (map[n.id] = { ...n, children: [] }));
    flat.forEach((n) => {
      if (n.parentId) map[n.parentId].children.push(map[n.id]);
    });
    return map[flat.find((n) => n.parentId === null)?.id];
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
      nodes.filter((n) => n.parentId === pid).forEach((c) => collect(c.id));
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
      className="relative w-full h-full overflow-hidden bg-gray-100"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
    >
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
          {nodes.map((n) => {
            if (!n.parentId) return null;
            const p = positions[n.parentId];
            const c = positions[n.id];
            if (!p || !c) return null;

            return (
              <path
                key={n.id}
                d={`M ${p.x + NODE_WIDTH} ${p.y + NODE_HEIGHT / 2}
                    C ${p.x + NODE_WIDTH + 40} ${p.y + NODE_HEIGHT / 2},
                      ${c.x - 40} ${c.y + NODE_HEIGHT / 2},
                      ${c.x} ${c.y + NODE_HEIGHT / 2}`}
                stroke="#888"
                fill="none"
                strokeWidth="2"
              />
            );
          })}
        </svg>

        {nodes.map((n) => {
          const p = positions[n.id];
          if (!p) return null;

          return (
            <div
              key={n.id}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute bg-white border rounded-xl shadow
                         px-3 py-2 text-center select-none"
              style={{
                left: p.x,
                top: p.y,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
              }}
            >
              <div className="font-medium">{n.text}</div>

              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => addNode(n.id)}
                className="absolute -right-3 top-1/2 -translate-y-1/2
                           w-6 h-6 rounded-full bg-blue-500 text-white"
              >
                +
              </button>

              {n.parentId && (
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => deleteNode(n.id)}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2
                             w-6 h-6 rounded-full bg-red-500 text-white"
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