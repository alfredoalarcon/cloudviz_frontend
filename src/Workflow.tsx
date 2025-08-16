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
import { Box, Stack, Radio, RadioGroup } from "@chakra-ui/react";
import graphData from "./data/dg_parents_generated_2.json";
import { layoutNodesForReactFlow } from "./layout";
import { updateEdges } from "./utils";
import { Graph } from "./types";
import { nodeTypes, resourceLayout, clusterPadding } from "./constants";
import HoverDock from "./components/HoverDock";

const rfStyle = {
  backgroundColor: "#f2f1f1ff",
};

function Flow() {
  // Get context values
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    setSelectedNodeId,
    displayIam,
    setDisplayIam,
  } = useAppContext();
  const nodesInitialized = useNodesInitialized();
  const { getInternalNode, fitView } = useReactFlow();

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
      const updatedNodes = nodes.map((node) => {
        // take into account display IAM
        if (node.type === "iam" && displayIam !== "res-role") {
          node.hidden = true;
        }

        if (node.id === "IAM Service" && displayIam !== "res-role") {
          node.hidden = true;
        }

        return {
          ...node,
          extent: "parent",
        };
      });

      // @ts-expect-error: Unreachable code error
      setNodes(updatedNodes);
      setEdges(edges);
    }

    layoutNodes();
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
        onPaneClick={() => setSelectedNodeId(null)}
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
