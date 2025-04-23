// app/mindmap/page.js
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Text, Line, Group } from "react-konva";
import Toolbar from "../../components/Toolabar";

export default function Mindmap() {
  const centerX = window.innerWidth / 2 - 60; // 60 is half of the width of the rectangle
  const centerY = window.innerHeight / 2 - 30; // 30 is half of the height of the rectangle

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
    reflowLayout();
  }, [layout, rectangles]);

  // To update the flow view
  const reflowLayout = () => {
    const newRects = [...rectangles];
    const rootRects = newRects.filter((r) => r.parentId === null);

    const updateChildren = (parent, level = 0) => {
      const children = newRects.filter((r) => r.parentId === parent.id);
      children.forEach((child, index) => {
        if (layout === "horizontal") {
          child.x = parent.x + parent.width + 100;
          child.y = parent.y + index * (parent.height + spacing);
        } else {
          child.x = parent.x + index * (parent.width + spacing);
          child.y = parent.y + parent.height + 100;
        }
        updateChildren(child, level + 1);
      });
    };

    rootRects.forEach((root, rootIndex) => {
      // You can optionally reposition roots too
      root.x = 50 + (layout === "horizontal" ? 0 : rootIndex * 200);
      root.y = 50 + (layout === "horizontal" ? rootIndex * 150 : 0);
      updateChildren(root);
    });

    console.log("refreshing");
    // Only update if layout has changed
    if (JSON.stringify(newRects) !== JSON.stringify(rectangles)) {
      setRectangles(newRects);
      console.log("refreshing really");
    }
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
        {/* <Layer> */}
        {/* Background Grid */}
        {/* {[...Array(200)].map((_, i) => (
            <Line
              key={"v" + i}
              points={[i * 50, 0, i * 50, 10000]}
              stroke="#eee"
              strokeWidth={1}
            />
          ))}
          {[...Array(200)].map((_, i) => (
            <Line
              key={"h" + i}
              points={[0, i * 50, 10000, i * 50]}
              stroke="#eee"
              strokeWidth={1}
            />
          ))} */}
        {/* </Layer> */}

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
                {mode === "edit" && rect.isHovered && (
                  <Group
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
                      handleAddRectangle(rect.id);
                      e.cancelBubble = true;
                    }}
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
              <Line
                key={child.id + "-line"}
                points={
                  layout === "vertical"
                    ? [
                        parent.x + parent.width / 2,
                        parent.y + parent.height,
                        child.x + child.width / 2,
                        child.y,
                      ]
                    : [
                        parent.x + parent.width,
                        parent.y + parent.height / 2,
                        child.x,
                        child.y + child.height / 2,
                      ]
                }
                stroke="#888"
                strokeWidth={2}
                // dash={[4, 2]}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
