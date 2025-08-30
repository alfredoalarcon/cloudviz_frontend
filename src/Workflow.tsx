import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  Background,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAppContext } from "./context/AppContext";
import type { NodeChange } from "@xyflow/react";
import { Box } from "@chakra-ui/react";
import { nodeTypes } from "./utils/constants";

const rfStyle = {
  backgroundColor: "#f2f1f1ff",
};

function Workflow() {
  // Get context values
  const { nodes, setNodes, edges, setSelInfoEntity, isPanelOpen } =
    useAppContext();

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

  // Adjust width based on whether panel is open
  const workflowWidth = isPanelOpen ? `calc(100% - 400px)` : "100%";

  return (
    <Box
      height="100vh"
      width={workflowWidth}
      transition="width 0.2s ease-in-out"
      position="relative"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        fitView
        style={rfStyle}
        nodeTypes={nodeTypes}
        onPaneClick={() => setSelInfoEntity(null)}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </Box>
  );
}

export default Workflow;
