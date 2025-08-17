// src/context/AppContext.tsx
import { useState, createContext, useContext } from "react";
import { Node, Edge } from "@xyflow/react";

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
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  // States to manage edges and nodes in react flow
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

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

  //  --------------- Panel Options -----------------
  // Values for iam display
  const [displayIam, setDisplayIam] = useState<"res-res" | "res-role" | "off">(
    "res-res"
  );

  // ----------------------------
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
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within <AppProvider>");
  return ctx;
};
