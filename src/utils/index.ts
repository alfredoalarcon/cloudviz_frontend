import { Edge, InternalNode, Node, MarkerType } from "@xyflow/react";
import { assignClosestHandles } from "../layout";
import { edgeLayout } from "../constants";

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
          stroke: edgeLayout.stroke.equality,
          strokeWidth: edgeLayout.strokeWidth.equality,
        };
      }

      //   Add arrows for iam edges
      else if (edge.data && edge.data.type == "iam") {
        edge.markerEnd = {
          type: MarkerType.ArrowClosed,
          color: edgeLayout.stroke.iam,
          height: edgeLayout.arrowSize,
          width: edgeLayout.arrowSize,
        };

        edge.style = {
          stroke: edgeLayout.stroke.iam,
          strokeWidth: edgeLayout.strokeWidth.iam,
        };
      } else if (edge.data && edge.data.type == "r2r") {
        edge.markerEnd = {
          type: MarkerType.ArrowClosed,
          color: edgeLayout.stroke.r2r,
          height: edgeLayout.arrowSize,
          width: edgeLayout.arrowSize,
        };

        edge.style = {
          stroke: edgeLayout.stroke.r2r,
          strokeWidth: edgeLayout.strokeWidth.r2r,
        };
      }

      return edge;
    });
  } else return edges;
}
