// src/context/AppContext.tsx
import { useState, createContext, useContext } from "react";
import { Node, Edge } from "@xyflow/react";

// Type definitions for context
type AppContextType = {
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  nodes: Node[];
  setNodes: (nodes: Node[]) => void;
  edges: Edge[];
  setEdges: (edges: Edge[]) => void;
  selectedNode: Node | undefined;
  displayIam: "res-res" | "res-role" | "off";
  setDisplayIam: (value: "res-res" | "res-role" | "off") => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  // States to manage edges and nodes in react flow
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // State to manage the selected node ID
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Get currently selected node
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  //  --------------- Panel Options -----------------
  // Values for iam display
  const [displayIam, setDisplayIam] = useState<"res-res" | "res-role" | "off">(
    "res-res"
  );

  // ----------------------------
  // Export values for context
  const value = {
    selectedNodeId,
    setSelectedNodeId,
    nodes,
    setNodes,
    edges,
    setEdges,
    selectedNode,
    displayIam,
    setDisplayIam,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within <AppProvider>");
  return ctx;
};
