import { useCallback, useState } from "react";
import {
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { initialNodes } from "./nodes";
import { initialEdges } from "./edges";
import type {
  NodeChange,
  EdgeChange,
  Connection,
  Node,
  Edge,
} from "@xyflow/react";
import { Box } from "@chakra-ui/react";

const rfStyle = {
  backgroundColor: "#D0C0F7",
};

function Flow() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  return (
    <Box height="100vh" width="100%">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        style={rfStyle}
        attributionPosition="top-right"
      >
        <Background />
      </ReactFlow>
    </Box>
  );
}

export default Flow;
