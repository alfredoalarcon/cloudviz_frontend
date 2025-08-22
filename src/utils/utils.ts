import { Edge, InternalNode, Node, MarkerType } from "@xyflow/react";
import { assignClosestHandles } from "../layout/hierarchical";
import { edgeLayout } from "./constants";
import { Graph, graphType } from "./types";
import { layoutNodesHierarchical } from "../layout/hierarchical";
import { layoutNodesWithElk } from "../layout/nonHierarchicalElk";
import { layoutNodesWithD3 } from "../layout/nonHierarchicalD3";
import { resourceLayout, clusterPadding } from "./constants";
import type { GraphManifest } from "./types";

// Update edge handles based on node positions, adds an animated property for equality edges
export function updateEdges(
  edges: Edge[],
  nodesInitialized: boolean,
  getInternalNode: (nodeId: string) => InternalNode<Node> | undefined,
  displayIam: "res-res" | "res-role" | "off",
  selectedNodeId: string | null,
  hoveredNodeId: string | null
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

      // Hover state if selectedNodeId is source or target
      const hasSelNodeId =
        edge.source === selectedNodeId || edge.target === selectedNodeId;
      const hasHoverSelId =
        edge.source === hoveredNodeId || edge.target === hoveredNodeId;
      const isHoveredOrSelected = hasSelNodeId || hasHoverSelId;
      const strokeWidthCoeff = isHoveredOrSelected ? edgeLayout.coeffHover : 1;

      // Add animation for equality edges
      if (edge.data && edge.data.type == "equality") {
        edge.animated = true;

        edge.style = {
          stroke: isHoveredOrSelected
            ? edgeLayout.stroke.equality
            : edgeLayout.strokeHoveredSel.equality,
          strokeWidth: strokeWidthCoeff * edgeLayout.strokeWidth.equality,
        };
      }

      //   Add arrows for iam edges
      else if (edge.data && (edge.data.type as string).includes("iam")) {
        if ((edge.data.type as string).includes(displayIam)) {
          edge.hidden = false;
          edge.markerEnd = {
            type: MarkerType.ArrowClosed,
            color: isHoveredOrSelected
              ? edgeLayout.strokeHoveredSel.iam
              : edgeLayout.stroke.iam,
            height: edgeLayout.arrowSize,
            width: edgeLayout.arrowSize,
          };

          edge.style = {
            stroke: isHoveredOrSelected
              ? edgeLayout.strokeHoveredSel.iam
              : edgeLayout.stroke.iam,
            strokeWidth: strokeWidthCoeff * edgeLayout.strokeWidth.iam,
          };
        } else {
          edge.hidden = true;
        }
      }

      // Edges of type other-res-res
      else if (edge.data && edge.data.type == "other-res-res") {
        edge.markerEnd = {
          type: MarkerType.ArrowClosed,
          color: isHoveredOrSelected
            ? edgeLayout.strokeHoveredSel.r2r
            : edgeLayout.stroke.r2r,
          height: edgeLayout.arrowSize,
          width: edgeLayout.arrowSize,
        };

        edge.style = {
          stroke: isHoveredOrSelected
            ? edgeLayout.strokeHoveredSel.r2r
            : edgeLayout.stroke.r2r,
          strokeWidth: strokeWidthCoeff * edgeLayout.strokeWidth.r2r,
        };
      }

      return edge;
    });
  } else return edges;
}

export async function layoutNodes(
  graphData: Graph,
  graphType: graphType,
  nonHierarchicalAlgo: "elk" | "d3" = "d3"
): Promise<Graph> {
  let nodes: Node[] = graphData.nodes;
  let edges: Edge[] = graphData.edges;

  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    padding: 32,
  };

  if (graphType === "simplified") {
    ({ nodes, edges } = await layoutNodesHierarchical(graphData, {
      direction: "DOWN",
      childDefaultSize: {
        width: resourceLayout.width,
        height: resourceLayout.height,
      },
      clusterPadding: `[top=${clusterPadding.top},left=${clusterPadding.left},bottom=${clusterPadding.bottom},right=${clusterPadding.right}]`,
      viewportSize: { width: viewport.width, height: viewport.height },
    }));
  } else {
    if (nonHierarchicalAlgo === "elk") {
      nodes = await layoutNodesWithElk(nodes, edges, viewport, {
        direction: "RIGHT",
      });
    } else {
      nodes = await layoutNodesWithD3(nodes, edges, viewport, {
        chargeStrength: -500,
        linkDistance: 140,
        iterations: 350,
      });
    }
  }

  return { nodes, edges };
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

    return node;
  });

  // @ts-ignore
  return updatedNodes;
}

// Fetch graph data based on the selected graph and type
export async function fetchGraphData(
  graphManifest: GraphManifest,
  selectedGraphName: string,
  selGraphType: string
) {
  // Resolve URI to fetch
  const graphUri = graphManifest.graphs.find(
    (graph) => graph.name === selectedGraphName
  )?.variants[selGraphType];

  // Fetch and initialize graph data
  let newGraph = { nodes: [] as Node[], edges: [] as Edge[] };
  if (graphUri) {
    newGraph = await fetch(graphUri).then((res) => res.json());
  }

  return newGraph;
}
