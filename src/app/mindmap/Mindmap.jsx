'use client';

import React, { useState, useCallback } from 'react';
import ReactFlow, { useNodesState, useEdgesState, addEdge, Handle } from 'reactflow';
import 'reactflow/dist/style.css';

// Initial nodes and edges
const initialNodes = [
  { id: '1', position: { x: 250, y: 0 }, data: { label: 'Home' } },
  { id: '2', position: { x: 100, y: 150 }, data: { label: 'About' } },
  { id: '3', position: { x: 250, y: 150 }, data: { label: 'Blog' } },
  { id: '4', position: { x: 400, y: 150 }, data: { label: 'Contact' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
  { id: 'e1-4', source: '1', target: '4', animated: true },
];

// Custom node component
const CustomNode = ({ id, data, selected, xPos, yPos }) => {
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  // Add a new node to the left or right
  const handleAddNode = (direction) => {
    const newNode = {
      id: `${Math.random()}`,
      position: direction === 'left' ? { x: xPos - 200, y: yPos } : { x: xPos + 200, y: yPos },
      data: { label: `Node ${id}` },
    };
    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [
      ...eds,
      { id: `e${id}-${newNode.id}`, source: id, target: newNode.id, animated: true },
    ]);
  };

  return (
    <div className="custom-node">
      <div>{data.label}</div>

      {/* Left Handle for connecting nodes */}
      <Handle
        type="target"
        position="left"
        style={{
          background: '#555',
          borderRadius: '50%',
          zIndex: 10, // Ensure it's clickable
        }}
      />

      {/* Add button on the left side */}
      <button
        onClick={() => handleAddNode('left')}
        className="add-node-btn left-btn"
      >
        +
      </button>

      {/* Right Handle for connecting nodes */}
      <Handle
        type="source"
        position="right"
        style={{
          background: '#555',
          borderRadius: '50%',
          zIndex: 10, // Ensure it's clickable
        }}
      />

      {/* Add button on the right side */}
      <button
        onClick={() => handleAddNode('right')}
        className="add-node-btn right-btn"
      >
        +
      </button>
    </div>
  );
};

// Node Types in React Flow
const nodeTypes = {
  custom: CustomNode,
};

export default function Mindmap() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>
  );
}
