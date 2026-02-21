"use client";

import { useEffect, useRef, useState } from "react";

const START_OFFSET_Y = 120;
const NODE_WIDTH = 140;
const NODE_HEIGHT = 60;
const GAP_X = 180;
const GAP_Y = 80;

export default function MindMap() {
    const containerRef = useRef(null);
    const [startOffsetX, setStartOffsetX] = useState(300);

useEffect(() => {
  setStartOffsetX(window.innerWidth / 4);
}, []);

  const [nodes, setNodes] = useState([
    { id: "1", text: "Start", parentId: null },
    { id: "2", text: "Child 1", parentId: "1" },
    { id: "3", text: "Child 2", parentId: "1" },
  ]);

  const [positions, setPositions] = useState({});

  /* ---------------- tree utils ---------------- */

  const buildTree = (flat) => {
    const map = {};
    flat.forEach((n) => (map[n.id] = { ...n, children: [] }));
    flat.forEach((n) => {
      if (n.parentId) map[n.parentId].children.push(map[n.id]);
    });
    return map[flat.find((n) => n.parentId === null)?.id];
  };

  const getContentBounds = () => {
    if (!nodes.length) return { width: 0, height: 0 };

    const maxX = Math.max(...nodes.map((n) => positions[n.id]?.x ?? 0));
    const maxY = Math.max(...nodes.map((n) => positions[n.id]?.y ?? 0));

    return {
      width: maxX + NODE_WIDTH + 200,
      height: maxY + NODE_HEIGHT + 200,
    };
  };

  const { width, height } = getContentBounds();

  /* ---------------- layout ---------------- */

  useEffect(() => {
    const tree = buildTree(nodes);
    if (!tree) return;

    const pos = {};
    let currentY = 0;

    const dfs = (node, depth) => {
      const children = node.children;

      if (children.length === 0) {
        pos[node.id] = {
          x: depth * GAP_X + startOffsetX,
          y: currentY + START_OFFSET_Y,
        };
        currentY += NODE_HEIGHT + GAP_Y;
        return;
      }

      children.forEach((c) => dfs(c, depth + 1));

      const first = pos[children[0].id];
      const last = pos[children[children.length - 1].id];

      pos[node.id] = {
        x: depth * GAP_X + startOffsetX,
        y: (first.y + last.y) / 2, // ✅ FIX
      };
    };

    dfs(tree, 0);
    setPositions(pos);
  }, [nodes]);

  /* ---------------- add node ---------------- */

  const addNode = (parentId) => {
    setNodes((prev) => [
      ...prev,
      { id: Date.now().toString(), text: "New", parentId },
    ]);
  };

  /* ---------------- delete node ---------------- */

  const deleteNode = (id) => {
    const ids = new Set();

    const collect = (nodeId) => {
      ids.add(nodeId);
      nodes.filter((n) => n.parentId === nodeId).forEach((c) => collect(c.id));
    };

    collect(id);
    setNodes((prev) => prev.filter((n) => !ids.has(n.id)));
  };

  /* ---------------- render ---------------- */

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-gray-100 overflow-auto"
    >
      {/* connections */}
      <svg
        className="absolute inset-0 pointer-events-none"
        preserveAspectRatio="none"
        width={width}
        height={height}
        style={{ overflow: "visible" }}
      >
        {nodes.map((n) => {
          if (!n.parentId) return null;
          const p = positions[n.parentId];
          const c = positions[n.id];
          if (!p || !c) return null;

          return (
            <path
              key={n.id}
              d={`
                M ${p.x + NODE_WIDTH} ${p.y + NODE_HEIGHT / 2}
                C ${p.x + NODE_WIDTH + 40} ${p.y + NODE_HEIGHT / 2},
                  ${c.x - 40} ${c.y + NODE_HEIGHT / 2},
                  ${c.x} ${c.y + NODE_HEIGHT / 2}
              `}
              stroke="#888"
              fill="none"
              strokeWidth="2"
            />
          );
        })}
      </svg>

      {/* nodes */}
      {nodes.map((n) => {
        const p = positions[n.id];
        if (!p) return null;

        return (
          <div
            key={n.id}
            className="group absolute rounded-xl border bg-white shadow px-3 py-2
                        text-center select-none"
            style={{
              left: p.x,
              top: p.y,
              width: NODE_WIDTH,
              height: NODE_HEIGHT,
            }}
          >
            <div className="font-medium">{n.text}</div>

            <button
              onClick={() => addNode(n.id)}
              className="
                    absolute -right-3 top-1/2 -translate-y-1/2
                    w-6 h-6 rounded-full bg-blue-500 text-white text-sm
                    opacity-0 scale-90
                    group-hover:opacity-100 group-hover:scale-100
                    hover:opacity-100
                    transition-all duration-150
                    shadow-md hover:shadow-lg
                "
            >
              +
            </button>

            {n.parentId && (
              <button
                onClick={() => deleteNode(n.id)}
                className="
                    absolute -bottom-3 left-1/2 -translate-x-1/2
                    w-6 h-6 rounded-full bg-red-500 text-white text-sm
                    opacity-0 scale-90
                    group-hover:opacity-100 group-hover:scale-100
                    hover:opacity-100
                    transition-all duration-150
                    "
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
