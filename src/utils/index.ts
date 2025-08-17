import { Edge, InternalNode, Node, MarkerType } from "@xyflow/react";
import { assignClosestHandles } from "../layout";
import { edgeLayout } from "../constants";
import graphData from "../data/dg_parents_generated_2.json";
import { Graph } from "../types";
import { layoutNodesForReactFlow } from "../layout";
import { resourceLayout, clusterPadding } from "../constants";

// Update edge handles based on node positions, adds an animated property for equality edges
export function updateEdges(
  edges: Edge[],
  nodesInitialized: boolean,
  getInternalNode: (nodeId: string) => InternalNode<Node> | undefined,
  iamDisplay: "res-res" | "res-role" | "off"
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
      else if (edge.data && (edge.data.type as string).includes("iam")) {
        if ((edge.data.type as string).includes(iamDisplay)) {
          edge.hidden = false;
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
        } else {
          edge.hidden = true;
        }
      }

      // Edges of type resource
      else if (edge.data && edge.data.type == "other-res-res") {
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

export async function layoutNodes(
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void
) {
  const { nodes, edges } = await layoutNodesForReactFlow(graphData as Graph, {
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
  });

  setNodes(nodes);
  setEdges(edges);
}

export function updateNodes(
  nodes: Node[],
  displayIam: "res-res" | "res-role" | "off"
): Node[] {
  // Add attributes to nodes before setting state
  const updatedNodes = nodes.map((n) => {
    const node = { ...n };
    // take into account display IAM
    if (node.type === "iam" && displayIam !== "res-role") {
      node.hidden = true;
    } else if (node.id === "IAM Service" && displayIam !== "res-role") {
      node.hidden = true;
    } else {
      node.hidden = false;
    }

    // Add extent
    node.extent = "parent";

    // Add drag handle positioning
    node.dragHandle = ".drag-handle";

    return node;
  });

  // @ts-ignore
  return updatedNodes;
}
