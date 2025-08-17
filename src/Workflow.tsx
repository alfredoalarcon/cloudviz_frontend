import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  Background,
  useReactFlow,
  useNodesInitialized,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAppContext } from "./context/AppContext";
import type { NodeChange } from "@xyflow/react";
import { Box } from "@chakra-ui/react";
import { updateEdges, layoutNodes, updateNodes } from "./utils";
import { nodeTypes } from "./constants";
import HoverDock from "./components/HoverDock";

const rfStyle = {
  backgroundColor: "#f2f1f1ff",
};

function Flow() {
  // Get context values
  const { nodes, setNodes, edges, setEdges, displayIam, setSelInfoEntity } =
    useAppContext();

  // Track if nodes have been initialized
  const nodesInitialized = useNodesInitialized();

  // Get react flow instance
  const { getInternalNode, fitView } = useReactFlow();

  // Layout nodes
  useEffect(() => {
    layoutNodes(setNodes, setEdges);
  }, []);

  // Update nodes
  useEffect(() => {
    const newNodes = updateNodes(nodes, displayIam);
    setNodes(newNodes);
  }, [displayIam]);

  // Update edges by computing handles and adding attributes
  useEffect(() => {
    const newEdges = updateEdges(
      edges,
      nodesInitialized,
      getInternalNode,
      displayIam
    );
    setEdges(newEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesInitialized, nodes, displayIam]);

  useEffect(() => {
    if (nodesInitialized) {
      fitView();
    }
  }, [nodesInitialized, displayIam]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelInfoEntity(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSelInfoEntity]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // @ts-ignore
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes, edges]
  );

  return (
    <Box height="100vh" width="100%">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        fitView
        style={rfStyle}
        attributionPosition="top-right"
        nodeTypes={nodeTypes}
        onPaneClick={() => setSelInfoEntity(null)}
      >
        <Controls />
        <Background />
      </ReactFlow>

      {/* Add the Hover Dock */}
      {/* Pin to top-left */}
      <HoverDock position={{ top: 5, left: 5 }} initialPinned={false} />
    </Box>
  );
}

export default Flow;
