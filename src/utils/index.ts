import { Edge, InternalNode, Node, MarkerType } from "@xyflow/react";
import { assignClosestHandles } from "../layout";

// Update edge handles based on node positions, adds an animated property for equality edges
export function updateEdges(
  edges: Edge[],
  nodesInitialized: boolean,
  getInternalNode: (nodeId: string) => InternalNode<Node> | undefined
) {
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

      // Add animation for equality edges
      if (edge.data && edge.data.type == "equality") {
        edge.animated = true;

        edge.style = {
          stroke: "#787878ff",
          strokeWidth: 1.1,
        };
      }

      //   Add arrows for iam edges
      if (edge.data && edge.data.type == "iam") {
        edge.markerEnd = {
          type: MarkerType.Arrow,
          color: "#9ac5e4ff",
          height: 18,
          width: 18,
        };

        edge.style = {
          stroke: "#9ac5e4ff",
          strokeWidth: 0.8,
        };
      }

      return edge;
    });
  } else return edges;
}
