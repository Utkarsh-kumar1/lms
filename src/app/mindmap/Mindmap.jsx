// app/mindmap/page.js
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Text, Line, Group, Path } from "react-konva";
import Toolbar from "../../components/Toolabar";

export default function Mindmap() {
  const [rectangles, setRectangles] = useState([
    {
      id: "1",
      text: "Start",
      x: 100,
      y: 400,
      width: 120,
      height: 60,
      fill: "#e0f2fe",
      isHovered: false,
      parentId: null,
    },
    {
      id: "2",
      text: "Start",
      x: 100,
      y: 400,
      width: 120,
      height: 60,
      fill: "#e0f2fe",
      isHovered: false,
      parentId: "1",
    },
    {
      id: "4",
      text: "Start",
      x: 100,
      y: 400,
      width: 120,
      height: 60,
      fill: "#e0f2fe",
      isHovered: false,
      parentId: "1",
    },
    {
      id: "3",
      text: "Start",
      x: 100,
      y: 400,
      width: 120,
      height: 60,
      fill: "#e0f2fe",
      isHovered: false,
      parentId: "1",
    },
  ]);
  const [selectedId, setSelectedId] = useState(null);
  const stageRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const [layout, setLayout] = useState("horizontal");
  const [mode, setMode] = useState("edit");
  const [tool, setTool] = useState(""); // Optional: for UI feedback

  const subtreeSizes = new Map();

  const handleToolSelect = (selected) => {
    switch (selected) {
      case "recenter":
        // recenter logic
        break;
      case "layoutToggle":
        setLayout((prev) =>
          prev === "horizontal" ? "vertical" : "horizontal"
        );
        console.log(layout);
        break;
      case "modeToggle":
        setMode((prev) => (prev === "edit" ? "view" : "edit"));
        console.log("Mode", mode);
        break;
      default:
        break;
    }
    setTool(selected); // for activeTool highlight if needed
  };

  // Handle panning
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const pos = e.evt;
    setLastMousePos({ x: pos.clientX, y: pos.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const pos = e.evt;
    const dx = pos.clientX - lastMousePos.x;
    const dy = pos.clientY - lastMousePos.y;

    setLastMousePos({ x: pos.clientX, y: pos.clientY });
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zooming (wheel)
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const oldScale = scale;
    const mousePointTo = {
      x: (e.evt.offsetX - position.x) / oldScale,
      y: (e.evt.offsetY - position.y) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setScale(newScale);
    setPosition({
      x: e.evt.offsetX - mousePointTo.x * newScale,
      y: e.evt.offsetY - mousePointTo.y * newScale,
    });
  };

  const spacing = 20;

  const handleStageMouseDown = () => {
    setSelectedId(null);
  };

  const handleTextEdit = (id, newText) => {
    if (mode === "view") return;
    const updated = rectangles.map((rect) =>
      rect.id === id ? { ...rect, text: newText } : rect
    );
    setRectangles(updated);
  };

  useEffect(() => {
    if (layout === "horizontal")
      setPosition({
        x: 0,
        y: 200,
      });
    else {
      setPosition({
        y: 0,
        x: 500,
      });
    }

    reflowLayout();
  }, [layout]);

  useEffect(() => {
    reflowLayout();
  }, [rectangles.length]);

  const reflowLayout = () => {
    const newRects = [...rectangles];
    subtreeSizes.clear(); // reset map

    const roots = newRects.filter((r) => r.parentId === null);

    roots.forEach((root) => measureSubtree(root));

    roots.forEach((root, i) => {
      const rootSize = subtreeSizes.get(root.id);
      const x =
        layout === "horizontal" ? 100 : 100 + i * (rootSize.width + 150);
      const y =
        layout === "horizontal" ? 100 + i * (rootSize.height + 150) : 100;
      positionSubtree(root, x, y);
    });

    setRectangles(newRects);
  };

  const measureSubtree = (node) => {
    const children = rectangles.filter((r) => r.parentId === node.id);
    if (children.length === 0) {
      const size = { width: node.width, height: node.height };
      subtreeSizes.set(node.id, size);
      return size;
    }

    let totalWidth = 0;
    let totalHeight = 0;

    const childSizes = children.map((child) => {
      const size = measureSubtree(child);
      if (layout === "horizontal") {
        totalHeight += size.height + spacing;
        totalWidth = Math.max(totalWidth, size.width);
      } else {
        totalWidth += size.width + spacing;
        totalHeight = Math.max(totalHeight, size.height);
      }
      return size;
    });

    if (layout === "horizontal") totalHeight -= spacing;
    else totalWidth -= spacing;

    const size = { width: totalWidth, height: totalHeight };
    subtreeSizes.set(node.id, size);
    return size;
  };

  const positionSubtree = (node, x, y) => {
    node.x = x;
    node.y = y;

    const children = rectangles.filter((r) => r.parentId === node.id);
    if (children.length === 0) return;

    let offsetX = x;
    let offsetY = y;

    const parentSize = subtreeSizes.get(node.id);

    if (layout === "horizontal") {
      offsetX += node.width + 100;
      offsetY -= parentSize.height / 2;
    } else {
      offsetY += node.height + 100;
      offsetX -= parentSize.width / 2;
    }

    children.forEach((child) => {
      const size = subtreeSizes.get(child.id);
      if (layout === "horizontal") {
        positionSubtree(child, offsetX, offsetY + size.height / 2);
        offsetY += size.height + spacing;
      } else {
        positionSubtree(child, offsetX + size.width / 2, offsetY);
        offsetX += size.width + spacing;
      }
    });
  };

  const centerLayout = () => {
    if (!stageRef.current || rectangles.length === 0) return;

    const stage = stageRef.current;
    const stageWidth = stage.width();
    const stageHeight = stage.height();

    const padding = 50;

    const minX = Math.min(...rectangles.map((r) => r.x));
    const maxX = Math.max(...rectangles.map((r) => r.x + r.width));
    const minY = Math.min(...rectangles.map((r) => r.y));
    const maxY = Math.max(...rectangles.map((r) => r.y + r.height));

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const offsetX = (stageWidth - contentWidth) / 2 - minX + padding;
    const offsetY = (stageHeight - contentHeight) / 2 - minY + padding;

    const newRects = rectangles.map((rect) => ({
      ...rect,
      x: rect.x + offsetX,
      y: rect.y + offsetY,
    }));

    setRectangles(newRects);
  };

  const handleAddRectangle = (parentId) => {
    const parent = rectangles.find((r) => r.id === parentId);
    const siblings = rectangles.filter((r) => r.parentId === parentId);
    const newY = parent.y + siblings.length * (parent.height + spacing);
    const newX = parent.x + parent.width + 100;
    const newId = `${Date.now()}`;

    const newRect = {
      id: newId,
      text: "New",
      x: newX,
      y: newY,
      width: 120,
      height: 60,
      fill: "#e0f2fe",
      isHovered: false,
      parentId: parentId,
    };
    setRectangles([...rectangles, newRect]);
  };

  const handleDelete = () => {
    if (selectedId) {
      setRectangles((prev) =>
        prev.filter((r) => r.id !== selectedId && r.parentId !== selectedId)
      );
      setSelectedId(null);
    }
  };

  return (
    <div className="relative w-full h-full  bg-gray-100">
      <Toolbar
        activeTool={tool}
        onToolSelect={handleToolSelect}
        layout={layout}
        mode={mode}
        centerLayout={centerLayout}
      />

      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        scale={{ x: scale, y: scale }}
        x={position.x}
        y={position.y}
        className="cursor-crosshair"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {rectangles.map((rect) => {
            const isSelected = rect.id === selectedId;
            return (
              <Group
                key={rect.id}
                x={rect.x}
                y={rect.y}
                draggable
                onClick={(e) => {
                  setSelectedId(rect.id);
                  e.cancelBubble = true;
                }}
                onDblClick={() => {
                  const newText = prompt("Edit text:", rect.text);
                  if (newText) handleTextEdit(rect.id, newText);
                }}
                // onDragEnd={(e) => {
                //   const updated = rectangles.map((r) =>
                //     r.id === rect.id
                //       ? { ...r, x: e.target.x(), y: e.target.y() }
                //       : r
                //   );

                //   setRectangles(updated);
                // }}

                // TODO: Implement targeted UI reflesh to counter laggy redenring
                onDragMove={(e) => {
                  const newX = e.target.x();
                  const newY = e.target.y();

                  setRectangles((prev) =>
                    prev.map((r) =>
                      r.id === rect.id ? { ...r, x: newX, y: newY } : r
                    )
                  );
                }}
                onMouseEnter={() => {
                  setRectangles((prev) =>
                    prev.map((r) =>
                      r.id === rect.id ? { ...r, isHovered: true } : r
                    )
                  );
                }}
                onMouseLeave={() => {
                  setRectangles((prev) =>
                    prev.map((r) =>
                      r.id === rect.id ? { ...r, isHovered: false } : r
                    )
                  );
                }}
              >
                <Rect
                  width={rect.width}
                  height={rect.height}
                  fill={rect.fill}
                  stroke={isSelected ? "#0ea5e9" : "#888"}
                  strokeWidth={2}
                  cornerRadius={10}
                />
                <Text
                  text={rect.text}
                  fontSize={16}
                  padding={10}
                  width={rect.width}
                  height={rect.height}
                  align="center"
                  verticalAlign="middle"
                />
                {mode === "edit" && (
                  <Group
                    // className={rect.isHovered ? "hidden" : "block"}
                    x={
                      layout === "vertical"
                        ? rect.width / 2 - 10
                        : rect.width - 10
                    }
                    y={
                      layout === "vertical"
                        ? rect.height - 10
                        : rect.height / 2 - 10
                    }
                    onClick={(e) => {
                      e.cancelBubble = true;
                      handleAddRectangle(rect.id);
                    }}
                    visible={rect.isHovered}
                  >
                    <Rect
                      width={20}
                      height={20}
                      fill="#bae6fd"
                      cornerRadius={5}
                    />
                    <Text
                      text="+"
                      fontSize={18}
                      width={20}
                      height={20}
                      align="center"
                      verticalAlign="middle"
                      fill="#0369a1"
                    />
                  </Group>
                )}
              </Group>
            );
          })}

          {/* Lines to children */}
          {rectangles.map((child) => {
            const parent = rectangles.find((p) => p.id === child.parentId);
            if (!parent) return null;
            return (
              <Path
                key={child.id + "-path"}
                data={
                  layout === "vertical"
                    ? `M ${parent.x + parent.width / 2},${
                        parent.y + parent.height
                      }
         Q ${child.x + child.width / 2},${
                        (parent.y + parent.height + child.y) / 2
                      }
           ${child.x + child.width / 2},${child.y}`
                    : `M ${parent.x + parent.width},${
                        parent.y + parent.height / 2
                      }
         Q ${(parent.x + parent.width + child.x) / 2},${
                        child.y + child.height / 2
                      }
           ${child.x},${child.y + child.height / 2}`
                }
                stroke="#888"
                strokeWidth={2}
                fill="transparent"
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
