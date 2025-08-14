import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type {
  NodeChange,
  EdgeChange,
  Connection,
  Node,
  Edge,
} from "@xyflow/react";
import { Box } from "@chakra-ui/react";
import graphData from "./data/dg_parents_generated_2.json";
import { layoutNodesForReactFlow } from "./utils";
import { Graph } from "./types";
import MainContainerComponent from "./components/nodes/MainContainer";
import ServiceComponent from "./components/nodes/ServiceContainer";
import IAMComponent from "./components/nodes/IAMComponent";
import ResourceComponent from "./components/nodes/ResourceComponent";

const rfStyle = {
  backgroundColor: "#f2f1f1ff",
};

function Flow() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Load and lay out graph data
  useEffect(() => {
    async function fetchData() {
      const graph = await layoutNodesForReactFlow(graphData as Graph, {
        direction: "DOWN",
        childDefaultSize: { width: 50, height: 50 },
        clusterPadding: "[top=30,left=30,bottom=30,right=30]",
      });
      console.log(graph);

      setNodes((prevNodes) => [...prevNodes, ...graph.nodes]);
      // setEdges((prevEdges) => [...prevEdges, ...graph.edges]);
    }

    fetchData();
  }, []);

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

  // Definition of nodeTypes
  const nodeTypes = {
    aws_container: MainContainerComponent,
    service_container: ServiceComponent,
    iam: IAMComponent,
    resource: ResourceComponent,
    vpc: ServiceComponent, // Assuming VPC uses the same component as Service
    subnet: ServiceComponent, // Assuming Subnet uses the same component as Service
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
      >
        <Background />
      </ReactFlow>
    </Box>
  );
}

export default Flow;
