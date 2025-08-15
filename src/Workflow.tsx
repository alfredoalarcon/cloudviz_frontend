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

import type {
  NodeChange,
  EdgeChange,
  Connection,
  Node,
  Edge,
  InternalNode,
} from "@xyflow/react";
import { Box } from "@chakra-ui/react";
import graphData from "./data/dg_parents_generated_2.json";
import { layoutNodesForReactFlow, assignClosestHandles } from "./layout";
import { Graph } from "./types";
import MainContainerComponent from "./components/nodes/MainContainer";
import ServiceComponent from "./components/nodes/ServiceContainer";
import IAMComponent from "./components/nodes/IAMComponent";
import ResourceComponent from "./components/nodes/ResourceComponent";
import EqualityEdge from "./components/edges/EqualityEdge";

const rfStyle = {
  backgroundColor: "#f2f1f1ff",
};

function Flow() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const nodesInitialized = useNodesInitialized();
  const { getInternalNode } = useReactFlow();

  // Load and lay out nodes
  useEffect(() => {
    async function layoutNodes() {
      const { nodes, edges } = await layoutNodesForReactFlow(
        graphData as Graph,
        {
          direction: "DOWN",
          childDefaultSize: { width: 50, height: 50 },
          clusterPadding: "[top=35,left=20,bottom=20,right=20]",
          viewportSize: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        }
      );
      setNodes(nodes);
      setEdges(edges);
    }

    layoutNodes();
  }, []);

  // Compute edge handles when nodes are initialized
  useEffect(() => {
    const newEdges = computeHandlers(edges);
    setEdges(newEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesInitialized]);

  function computeHandlers(edges: Edge[]) {
    if (nodesInitialized) {
      return edges.map((e) => {
        const edge = { ...e };
        const source = getInternalNode(edge.source) as InternalNode;
        const target = getInternalNode(edge.target) as InternalNode;
        const { sourceHandle, targetHandle } = assignClosestHandles(
          source,
          target
        );

        edge.sourceHandle = sourceHandle;
        edge.targetHandle = targetHandle;

        return edge;
      });
    } else return edges;
  }

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      // Update edge handles
      const newEdges = computeHandlers(edges);
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

  // Definition of nodeTypes
  const nodeTypes = {
    aws_container: MainContainerComponent,
    service_container: ServiceComponent,
    iam: IAMComponent,
    resource: ResourceComponent,
    vpc: ServiceComponent, // Assuming VPC uses the same component as Service
    subnet: ServiceComponent, // Assuming Subnet uses the same component as Service
  };

  // Definition of edgeTypes
  const edgeTypes = {
    equality: EqualityEdge,
    iam: EqualityEdge,
  };

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
        edgeTypes={edgeTypes}
      >
        <Background />
      </ReactFlow>
    </Box>
  );
}

export default Flow;
