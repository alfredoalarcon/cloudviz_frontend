import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  useReactFlow,
  useNodesInitialized,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAppContext } from "./context/AppContext";

import type {
  NodeChange,
  EdgeChange,
  Connection,
  Node,
  Edge,
} from "@xyflow/react";
import { Box } from "@chakra-ui/react";
import graphData from "./data/dg_parents_generated_2.json";
import { layoutNodesForReactFlow } from "./layout";
import { updateEdges } from "./utils";
import { Graph } from "./types";
import { nodeTypes, resourceLayout, clusterPadding } from "./constants";
const rfStyle = {
  backgroundColor: "#f2f1f1ff",
};

function Flow() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const nodesInitialized = useNodesInitialized();
  const { getInternalNode } = useReactFlow();
  const { setSelectedNodeId, selectedNodeId } = useAppContext();

  // Load and lay out nodes
  useEffect(() => {
    async function layoutNodes() {
      const { nodes, edges } = await layoutNodesForReactFlow(
        graphData as Graph,
        {
          direction: "DOWN",
          childDefaultSize: {
            width: resourceLayout.width,
            height: resourceLayout.height,
          },
          clusterPadding: `[top=${clusterPadding.top},left=${clusterPadding.left},bottom=${clusterPadding.bottom},right=${clusterPadding.right}]`,
          viewportSize: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        }
      );

      // Add attributes to nodes before setting state
      const updatedNodes = nodes.map((node) => ({
        ...node,
        extent: "parent",
      }));
      // @ts-expect-error: Unreachable code error
      setNodes(updatedNodes);
      setEdges(edges);
    }

    layoutNodes();
  }, []);

  // Compute edge handles when nodes are initialized
  useEffect(() => {
    const newEdges = updateEdges(edges, nodesInitialized, getInternalNode);
    setEdges(newEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesInitialized]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedNodeId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSelectedNodeId]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      // Update edge handles
      const newEdges = updateEdges(edges, nodesInitialized, getInternalNode);
      setEdges(newEdges);
    },
    [setNodes, edges]
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
        nodeTypes={nodeTypes}
        onPaneClick={() => setSelectedNodeId(null)}
      >
        <Background />
      </ReactFlow>
    </Box>
  );
}

export default Flow;
