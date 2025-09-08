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
import { R2_GRAPHS_URL } from "../utils/constants";

// Checkov data types
interface CheckovResourceError {
  has_issues: boolean;
  failed_count: number;
  passed_count?: number; // Number of passed checks
  error_details?: string; // Optional field
}

interface CheckovResourceErrors {
  [key: string]: CheckovResourceError;
}

interface CheckovDetailedResult {
  metadata: {
    graph_name: string;
    total_checks: number;
    total_failed: number;
    total_passed: number;
    total_skipped: number;
    resources_with_issues: number;
  };
  resources: Record<string, any>;
  summary: {
    by_status: Record<string, number>;
    by_check_type: Record<string, number>;
    by_file: Record<string, number>;
  };
}

// Type definitions for context
type AppContextType = {
  nodes: Node[];
  setNodes: (nodes: Node[]) => void;
  edges: Edge[];
  setEdges: (edges: Edge[]) => void;
  selectedNode: Node | undefined;
  displayIam: "res-res" | "res-role" | "off";
  setDisplayIam: (value: "res-res" | "res-role" | "off") => void;
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  isResizing: boolean;
  setIsResizing: (value: boolean) => void;
  // Options for graph selection
  selectedGraphName: string | null;
  setSelectedGraphName(name: string): void;
  setSelGraphType(type: graphType): void;
  selGraphType: graphType;
  graphManifest: GraphManifest | null;
  displayEdgeLabels: boolean;
  setDisplayEdgeLabels: (value: boolean) => void;
  isPanelOpen: boolean;
  setIsPanelOpen: (value: boolean) => void;
  // SidePanel tab selection
  selectedTab: "debug" | "menu" | "checkov";
  setSelectedTab: (tab: "debug" | "menu" | "checkov") => void;
  // Checkov data
  checkovResourceErrors: CheckovResourceErrors | null;
  checkovDetailedResults: CheckovDetailedResult | null;
  checkovLoading: boolean;
  checkovError: string | null;
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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Get currently selected node
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

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

  // Display edges labels
  const [displayEdgeLabels, setDisplayEdgeLabels] = useState(false);

  // Panel visibility control
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // SidePanel tab selection
  const [selectedTab, setSelectedTab] = useState<"debug" | "menu" | "checkov">(
    "checkov"
  );

  // Checkov data states
  const [checkovResourceErrors, setCheckovResourceErrors] =
    useState<CheckovResourceErrors | null>(null);
  const [checkovDetailedResults, setCheckovDetailedResults] =
    useState<CheckovDetailedResult | null>(null);
  const [checkovLoading, setCheckovLoading] = useState(false);
  const [checkovError, setCheckovError] = useState<string | null>(null);

  // -------------------------- Effects ----------------------------

  // Load available graphs (graphManifest) from local storage and set the first value
  useEffect(() => {
    async function loadGraphs() {
      const response = await fetch(`${R2_GRAPHS_URL}/graphs/index.json`);
      if (response.ok) {
        const graphManifest = await response.json();
        setGraphManifest(graphManifest);
      } else {
        console.error(
          `Failed to fetch graph manifest: ${response.status} ${response.statusText}`
        );
      }
    }
    loadGraphs();
  }, []);

  // Load Checkov data when graph changes
  useEffect(() => {
    const loadCheckovData = async () => {
      if (!selectedGraphName) return;

      setCheckovLoading(true);
      setCheckovError(null);

      try {
        // Load resource errors
        const resourceErrorsResponse = await fetch(
          `${R2_GRAPHS_URL}/checkov/${selectedGraphName}/checkov_resource_errors.json`
        );
        if (resourceErrorsResponse.ok) {
          const resourceErrors = await resourceErrorsResponse.json();

          setCheckovResourceErrors(resourceErrors);
        } else {
          console.warn(
            `Failed to load Checkov resource errors for ${selectedGraphName}`
          );
          setCheckovResourceErrors(null);
        }

        // Load detailed results
        const detailedResultsResponse = await fetch(
          `${R2_GRAPHS_URL}/checkov/${selectedGraphName}/checkov_results_detailed.json`
        );
        if (detailedResultsResponse.ok) {
          const detailedResults = await detailedResultsResponse.json();
          setCheckovDetailedResults(detailedResults);
        } else {
          console.warn(
            `Failed to load Checkov detailed results for ${selectedGraphName}`
          );
          setCheckovDetailedResults(null);
        }
      } catch (error) {
        console.error("Failed to load Checkov data:", error);
        setCheckovError(
          error instanceof Error ? error.message : "Failed to load Checkov data"
        );
        setCheckovResourceErrors(null);
        setCheckovDetailedResults(null);
      } finally {
        setCheckovLoading(false);
      }
    };

    // Load data when graph changes
    if (selectedGraphName) {
      loadCheckovData();
    }
  }, [selectedGraphName, selectedTab]);

  // Whenever graphType or selectedGraphName change update nodes and setup layout
  useEffect(() => {
    async function setupGraph() {
      if (graphManifest && selectedGraphName) {
        let newGraph = await fetchGraphData(
          graphManifest,
          selectedGraphName,
          selGraphType
        );
        // Update nodes
        newGraph.nodes = updateNodes(newGraph.nodes, selGraphType, displayIam);

        // Layout nodes
        newGraph = await layoutNodes(newGraph, selGraphType);

        // Update state with new graph data
        setNodes(newGraph.nodes);
        setEdges(newGraph.edges);
      }
    }

    setupGraph();
  }, [selGraphType, selectedGraphName, graphManifest]);

  // Handle iamDisplay
  useEffect(() => {
    async function updateLayout() {
      const newNodes = updateNodes(nodes, selGraphType, displayIam);
      const graph = await layoutNodes({ nodes: newNodes, edges }, selGraphType);
      setNodes(graph.nodes);
    }
    updateLayout();
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
      selGraphType,
      displayEdgeLabels
    );
    setEdges(newEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    nodesInitialized,
    nodes,
    displayIam,
    hoveredNodeId,
    selectedNodeId,
    displayEdgeLabels,
  ]);

  // Fit view when nodes are initialized or displayIam changes
  useEffect(() => {
    if (nodesInitialized) {
      fitView();
    }
  }, [nodesInitialized, displayIam]);

  // ---------------------------- Context Value ----------------------------
  // Export values for context
  const value = {
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
    setSelectedNodeId,
    isResizing,
    setIsResizing,
    selectedGraphName,
    setSelectedGraphName,
    selGraphType,
    setSelGraphType,
    graphManifest,
    displayEdgeLabels,
    setDisplayEdgeLabels,
    isPanelOpen,
    setIsPanelOpen,
    selectedTab,
    setSelectedTab,
    // Checkov data
    checkovResourceErrors,
    checkovDetailedResults,
    checkovLoading,
    checkovError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within <AppProvider>");
  return ctx;
};
