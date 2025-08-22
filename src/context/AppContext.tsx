// src/context/AppContext.tsx
import { useState, createContext, useContext, useEffect } from "react";
import { Node, Edge, useReactFlow, useNodesInitialized } from "@xyflow/react";
import type { GraphManifest, graphType } from "../utils/types";
import {
  fetchGraphData,
  layoutNodes,
  updateNodes,
  updateEdges,
} from "../utils/utils";

// Type definitions for context
type AppContextType = {
  nodes: Node[];
  setNodes: (nodes: Node[]) => void;
  edges: Edge[];
  setEdges: (edges: Edge[]) => void;
  selectedNode: Node | undefined;
  displayIam: "res-res" | "res-role" | "off";
  setDisplayIam: (value: "res-res" | "res-role" | "off") => void;
  selInfoEntity: { type: "node" | "edge"; id: string } | null;
  setSelInfoEntity: (
    entity: { type: "node" | "edge"; id: string } | null
  ) => void;
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  selectedNodeId: string | null;
  isResizing: boolean;
  setIsResizing: (value: boolean) => void;
  // Options for graph selection
  selectedGraphName: string | null;
  setSelectedGraphName(name: string): void;
  setSelGraphType(type: graphType): void;
  selGraphType: graphType;
  graphManifest: GraphManifest | null;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  // States to manage edges and nodes in react flow
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Track if nodes have been initialized
  const nodesInitialized = useNodesInitialized();

  // Get react flow instance
  const { getInternalNode, fitView } = useReactFlow();

  // State to manage the selected node ID
  const [selInfoEntity, setSelInfoEntity] = useState<{
    type: "node" | "edge";
    id: string;
  } | null>(null);

  // Get currently selected node or edge
  const selectedNode = nodes.find(
    (node) => node.id === selInfoEntity?.id && selInfoEntity?.type === "node"
  );
  const selectedNodeId = selectedNode?.id || null;

  // Keep track on hovered node
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  // ---------- Graph type selection options -----------

  // Object holding manifest for available graphs
  const [graphManifest, setGraphManifest] = useState<GraphManifest | null>(
    null
  );

  // selected graph type
  const [selectedGraphName, setSelectedGraphName] = useState<string | null>(
    "terragoat"
  );

  // Type of graph to display
  const [selGraphType, setSelGraphType] = useState<graphType>("complete");

  //  --------------- Panel Options -----------------
  // Values for iam display
  const [displayIam, setDisplayIam] = useState<"res-res" | "res-role" | "off">(
    "res-res"
  );

  // Resize activated
  const [isResizing, setIsResizing] = useState(false);

  // ---------------------------- Effects ----------------------------

  // Load available graphs (graphManifest) from local storage and set the first value
  useEffect(() => {
    async function loadGraphs() {
      const response = await fetch("/graphs/index.json");
      if (response.ok) {
        const graphManifest = await response.json();

        setGraphManifest(graphManifest);
      }
    }
    loadGraphs();
  }, []);

  // Whenever graphType or selectedGraphName change update nodes and setup layout
  useEffect(() => {
    async function setupGraph() {
      if (graphManifest && selectedGraphName) {
        let newGraph = await fetchGraphData(
          graphManifest,
          selectedGraphName,
          selGraphType
        );

        // Layout nodes
        newGraph = await layoutNodes(newGraph, selGraphType);

        // Update nodes
        newGraph.nodes = updateNodes(newGraph.nodes, selGraphType, displayIam);

        // Update state with new graph data
        setNodes(newGraph.nodes);
        setEdges(newGraph.edges);
      }
    }

    setupGraph();
  }, [selGraphType, selectedGraphName, graphManifest]);

  // Handle iamDisplay
  useEffect(() => {
    const newNodes = updateNodes(nodes, selGraphType, displayIam);
    setNodes(newNodes);
  }, [displayIam]);

  // Update edges by computing handles and adding attributes
  useEffect(() => {
    const newEdges = updateEdges(
      edges,
      nodesInitialized,
      getInternalNode,
      displayIam,
      selectedNodeId,
      hoveredNodeId,
      selGraphType
    );
    setEdges(newEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesInitialized, nodes, displayIam, hoveredNodeId, selectedNodeId]);

  useEffect(() => {
    if (nodesInitialized) {
      fitView();
    }
  }, [nodesInitialized, displayIam]);

  // ---------------------------- Context Value ----------------------------
  // Export values for context
  const value = {
    selInfoEntity,
    setSelInfoEntity,
    nodes,
    setNodes,
    edges,
    setEdges,
    selectedNode,
    displayIam,
    setDisplayIam,
    hoveredNodeId,
    setHoveredNodeId,
    selectedNodeId,
    isResizing,
    setIsResizing,
    selectedGraphName,
    setSelectedGraphName,
    selGraphType,
    setSelGraphType,
    graphManifest,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within <AppProvider>");
  return ctx;
};
