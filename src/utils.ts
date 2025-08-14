import { Node } from "@xyflow/react";
import ELK from "elkjs/lib/elk.bundled.js";
import { Graph } from "./types";

type Direction = "DOWN" | "UP" | "LEFT" | "RIGHT";
type Size = { width: number; height: number };

export type LayoutOptions = {
  /**
   * ELK direction, defaults to 'DOWN' (top -> bottom)
   */
  direction?: Direction;

  /**
   * Default size for leaf (non-parent) nodes.
   * ELK will compute compound sizes from children.
   */
  childDefaultSize?: Size;

  /**
   * Optional per-node sizing override for leaf nodes.
   * Return undefined to use childDefaultSize.
   */
  sizeByNode?: (node: Node) => Size | undefined;

  /**
   * Optional padding inside compound nodes (ELK string)
   * e.g. "[top=30,left=30,bottom=30,right=30]"
   */
  clusterPadding?: string;
};

/**
 * Layout nodes for React Flow (positions relative to parent, sizes in style.width/height).
 * - Leaves edges unchanged.
 * - Treats `parentId` as cluster/compound container (implicit parents supported),
 *   mirroring the layout approach in cytoscape_elk_clusters.html.
 */
export async function layoutNodesForReactFlow(
  raw: Graph,
  {
    direction = "DOWN",
    childDefaultSize = { width: 160, height: 40 },
    sizeByNode,
    clusterPadding,
  }: LayoutOptions = {}
): Promise<Graph> {
  const elk = new ELK();

  // --- Ensure all referenced parents exist (so they behave as clusters) ---
  const ids = new Set(raw.nodes.map((n) => n.id));
  const parentIds = new Set(
    raw.nodes.map((n) => n.parentId).filter(Boolean) as string[]
  );
  const missingParents = [...parentIds].filter((pid) => !ids.has(pid));
  const initialPosition = { x: 0, y: 0 };

  if (missingParents.length) {
    raw.nodes.push(
      ...missingParents.map((pid) => ({
        id: pid,
        type: "group",
        data: { implicit: true },
        position: initialPosition,
      }))
    );
  }

  // --- Index children by parentId ---
  const childrenOf = new Map<string | undefined, Node[]>();
  for (const n of raw.nodes) {
    const k = n.parentId ?? undefined;
    if (!childrenOf.has(k)) childrenOf.set(k, []);
    childrenOf.get(k)!.push(n);
  }

  // --- Build ELK graph (nodes only; edges are not needed for position/size here) ---
  type ElkNode = {
    id: string;
    width?: number;
    height?: number;
    children?: ElkNode[];
    labels?: Array<{ text: string }>;
    layoutOptions?: Record<string, string>;
  };

  const getLeafSize = (n: Node): Size => {
    const s = sizeByNode?.(n);
    return s ?? childDefaultSize;
  };

  function buildElkSubtree(parentId?: string): ElkNode[] {
    const kids = childrenOf.get(parentId) ?? [];

    return kids.map((n) => {
      const grandkids = childrenOf.get(n.id) ?? [];
      const isCompound = grandkids.length > 0;

      if (isCompound) {
        return {
          id: n.id,
          children: buildElkSubtree(n.id),
          // optional: keep a label if you want
          // labels: [{ text: n.data?.label ?? n.id }],
          layoutOptions: {
            ...(clusterPadding
              ? { "elk.padding": clusterPadding }
              : { "elk.padding": "30" }),
            // (optional) also increase spacing between the children themselves:
            // "elk.spacing.nodeNode": "40"
          },
        };
      }

      const s = getLeafSize(n);
      return { id: n.id, width: s.width, height: s.height };
    });
  }

  const elkGraph: any = {
    id: "root",
    children: buildElkSubtree(undefined),
    layoutOptions: {
      // Mirror the HTML demo: layered + direction + spacing + orthogonal routing.
      "elk.algorithm": "layered",
      "elk.direction": direction,
      "elk.spacing.nodeNode": "80",
      "elk.layered.spacing.nodeNodeBetweenLayers": "80",
      "elk.spacing.edgeEdge": "15",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.mergeEdges": "true",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.spacing.componentComponent": "90",
      ...(clusterPadding ? { "elk.padding": clusterPadding } : {}),
    },
  };

  const laidOut = await elk.layout(elkGraph);

  // --- Gather absolute positions/sizes from ELK (top-left origin) ---
  type Box = {
    x: number;
    y: number;
    width: number;
    height: number;
    parent?: string;
  };
  const absBox = new Map<string, Box>();

  function visit(node: any, parent?: any) {
    // SAFETY: if parent isn't cached, fall back to origin (prevents "reading 'x' of undefined")
    const parentBox =
      parent && absBox.get(parent.id)
        ? absBox.get(parent.id)!
        : { x: 0, y: 0, width: 0, height: 0 };

    const x = (node.x ?? 0) + parentBox.x;
    const y = (node.y ?? 0) + parentBox.y;
    const width = node.width ?? 0;
    const height = node.height ?? 0;

    absBox.set(node.id, { x, y, width, height, parent: parent?.id });

    for (const c of node.children ?? []) visit(c, node);
  }

  // IMPORTANT: don't pass the ELK root as the parent into the first call
  for (const c of laidOut.children ?? []) {
    visit(c /* no parent */);
  }

  // --- Convert to relative positions (React Flow expects child positions relative to parent) ---
  const relBox = new Map<string, Box>();
  for (const [id, b] of absBox) {
    if (!b.parent) {
      relBox.set(id, b);
    } else {
      const p = absBox.get(b.parent);
      const px = p?.x ?? 0;
      const py = p?.y ?? 0;
      relBox.set(id, { ...b, x: b.x - px, y: b.y - py });
    }
  }

  // --- Write back to nodes: position + style.width/height; keep parentId (RF uses parentNode/extent) ---
  const updatedNodes = raw.nodes.map<Node>((n) => {
    const elkBox = relBox.get(n.id);
    const isCompound = (childrenOf.get(n.id) ?? []).length > 0;

    // Size: compounds from ELK; leaves from input sizing
    const size = isCompound
      ? { width: elkBox?.width ?? 0, height: elkBox?.height ?? 0 }
      : getLeafSize(n);

    return {
      ...n,
      parentNode: n.parentId,
      ...(n.parentId ? { extent: "parent" as const } : {}),
      position: { x: elkBox?.x ?? 0, y: elkBox?.y ?? 0 },
      style: {
        ...(n.style || {}),
        width: size.width,
        height: size.height,
      },
    };
  });

  // Edges untouched
  return { nodes: updatedNodes, edges: raw.edges };
}

// ----- Example usage in your component -----
// In your component:
// useEffect(() => {
//   (async () => {
//     const laidOut = await layoutNodesForReactFlow(graphData, {
//       direction: 'DOWN',
//       childDefaultSize: { width: 180, height: 48 },
//       // sizeByNode: (n) => (n.type === 'subnet' ? { width: 200, height: 56 } : undefined),
//       // clusterPadding: '[top=30,left=30,bottom=30,right=30]',
//     });
//     console.log(laidOut);
//     // set state with laidOut.nodes and raw edges, etc.
//   })();
// }, []);
