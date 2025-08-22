// utils.ts
// ELK-aware layout for React Flow graphs, including edges and multiple handles -> ELK ports.
// Fixed: positions stay RELATIVE for children (no parent offset accumulation).
// Behavior: identical to original when all parents exist.
// If some parentId has no corresponding node, we create ELK-only virtual groups to keep siblings together.

import ELK from "elkjs/lib/elk.bundled.js";
import { Graph } from "../utils/types";
import { Node, Edge, InternalNode } from "@xyflow/react";

export type Direction = "RIGHT" | "LEFT" | "DOWN" | "UP";

export type LayoutOptions = {
  direction?: Direction;
  childDefaultSize?: { width: number; height: number };
  sizeByNode?: (n: Node) => { width: number; height: number } | undefined;
  clusterPadding?: string; // e.g., "24" or "24,24,24,24"
  elkOptionsOverride?: Record<string, string>;
  // No new public options needed — behavior changes only when parents are missing.
};

type ElkNode = {
  id: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  children?: ElkNode[];
  layoutOptions?: Record<string, string>;
  ports?: Array<{ id: string; properties?: Record<string, string> }>;
};

type ElkEdge = {
  id: string;
  sources: string[]; // ["nodeId"] or ["nodeId:portId"]
  targets: string[]; // ["nodeId"] or ["nodeId:portId"]
};

type ElkGraph = {
  id: string;
  children: ElkNode[];
  edges: ElkEdge[];
  layoutOptions?: Record<string, string>;
};

const DEFAULT_CHILD_SIZE = { width: 160, height: 40 };

function mapById<T extends { id: string }>(arr: T[]): Map<string, T> {
  const m = new Map<string, T>();
  for (const it of arr) m.set(it.id, it);
  return m;
}

/**
 * Layout a React Flow graph with ELK (layered). Takes edges into account and
 * respects multiple handles by creating ELK ports.
 *
 * Returns a new Graph with updated node positions and sizes (for groups/compounds).
 * Edges are returned as-is (React Flow will render them normally).
 */
export async function layoutNodesHierarchical(
  raw: Graph,
  {
    direction = "DOWN",
    childDefaultSize = DEFAULT_CHILD_SIZE,
    sizeByNode,
    clusterPadding,
    elkOptionsOverride,
    viewportSize,
  }: LayoutOptions & { viewportSize?: { width: number; height: number } } = {}
): Promise<Graph> {
  const elk = new ELK();

  // compute aspect ratio from viewport -------------------------------
  let aspectRatio: number | undefined;
  if (viewportSize?.width && viewportSize?.height) {
    // 1.6 is a magic factor to make the view wider (tuned)
    aspectRatio = (1 * viewportSize.width) / viewportSize.height;
  } else if (
    typeof window !== "undefined" &&
    window.innerWidth &&
    window.innerHeight
  ) {
    aspectRatio = (1.6 * window.innerWidth) / window.innerHeight;
  }

  // Clone to avoid mutating the caller’s arrays.
  const nodes = raw.nodes.map((n) => ({ ...n, position: { ...n.position } }));
  const edges = raw.edges.map((e) => ({ ...e }));

  const nodeById = mapById(nodes);

  // Build children map (compound support via parentId)
  const childrenOf = new Map<string | undefined, Node[]>();
  for (const n of nodes) {
    const key = n.parentId ?? undefined;
    if (!childrenOf.has(key)) childrenOf.set(key, []);
    childrenOf.get(key)!.push(n);
  }

  const getLeafSize = (n: Node) => {
    if (sizeByNode) {
      const s = sizeByNode(n);
      if (s) return s;
    }
    return {
      width: n.width ?? childDefaultSize.width,
      height: n.height ?? childDefaultSize.height,
    };
  };

  const buildElkSubtree = (parentId?: string): ElkNode[] => {
    const kids = childrenOf.get(parentId) ?? [];
    return kids.map<ElkNode>((n) => {
      const grandkids = childrenOf.get(n.id) ?? [];
      const isCompound = grandkids.length > 0;

      if (isCompound) {
        return {
          id: n.id,
          children: buildElkSubtree(n.id),
          layoutOptions: {
            ...(clusterPadding
              ? { "elk.padding": clusterPadding }
              : { "elk.padding": "24" }),
          },
        };
      }

      const s = getLeafSize(n);
      return { id: n.id, width: s.width, height: s.height };
    });
  };

  const elkEdges: ElkEdge[] = edges.map((e) => ({
    id: e.id ?? `${e.source}-${e.target}`,
    sources: [e.source],
    targets: [e.target],
  }));

  // ---- Detect missing parents. Only change behavior if any are missing.
  const nodeIds = new Set(nodes.map((n) => n.id));
  const referencedParents = Array.from(childrenOf.keys()).filter(
    (k): k is string => typeof k === "string"
  );
  const virtualParentIds = referencedParents.filter((pid) => !nodeIds.has(pid));
  const hasMissingParents = virtualParentIds.length > 0;

  // Build ELK children:
  // - If no parents are missing: original behavior (root = buildElkSubtree(undefined))
  // - If some parents are missing: create ELK-only virtual compounds to keep those siblings grouped
  const rootChildren: ElkNode[] = [];

  // Always include real root subtree as before
  rootChildren.push(...buildElkSubtree(undefined));

  if (hasMissingParents) {
    for (const vpid of virtualParentIds) {
      const kids = childrenOf.get(vpid) ?? [];
      // Group all children under an ELK-only container so they lay out together
      const compoundKids: ElkNode[] = kids.map((n) => {
        const grand = childrenOf.get(n.id) ?? [];
        const isCompound = grand.length > 0;
        if (isCompound) {
          return {
            id: n.id,
            children: buildElkSubtree(n.id),
            layoutOptions: {
              ...(clusterPadding
                ? { "elk.padding": clusterPadding }
                : { "elk.padding": "24" }),
            },
          };
        }
        const s = getLeafSize(n);
        return { id: n.id, width: s.width, height: s.height };
      });

      rootChildren.push({
        id: `__virtual__${vpid}`, // ELK-only container; won’t be written back
        children: compoundKids,
        layoutOptions: {
          ...(clusterPadding
            ? { "elk.padding": clusterPadding }
            : { "elk.padding": "24" }),
        },
      });
    }
  }

  const elkGraph: ElkGraph = {
    id: "root",
    children: hasMissingParents ? rootChildren : buildElkSubtree(undefined),
    edges: elkEdges,
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": direction,
      ...(aspectRatio && !("elk.aspectRatio" in (elkOptionsOverride ?? {}))
        ? { "elk.aspectRatio": String(aspectRatio) }
        : {}),
      "elk.spacing.nodeNode": "20",
      "elk.layered.spacing.nodeNodeBetweenLayers": "80",
      "elk.spacing.edgeEdge": "15",
      "elk.spacing.componentComponent": "50",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.mergeEdges": "true",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      ...(clusterPadding ? { "elk.padding": clusterPadding } : {}),
      ...(elkOptionsOverride ?? {}),
    },
  };

  const layouted = (await elk.layout(elkGraph)) as ElkGraph;

  const applyPositions = (elkNode: ElkNode) => {
    const n = nodeById.get(elkNode.id);
    if (n) {
      n.position = { x: elkNode.x ?? 0, y: elkNode.y ?? 0 };
      if (elkNode.width != null) n.width = elkNode.width;
      if (elkNode.height != null) n.height = elkNode.height;
    }
    elkNode.children?.forEach(applyPositions);
  };

  for (const child of layouted.children ?? []) applyPositions(child);

  return { nodes, edges };
}

/* ------------------------------ Convenience ------------------------------- */

export async function layout(
  nodes: Node[],
  edges: Edge[],
  options?: LayoutOptions
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const { nodes: nn, edges: ee } = await layoutNodesHierarchical(
    { nodes, edges },
    options
  );
  return { nodes: nn, edges: ee };
}

//  ------------ Edge port positioning -------------------

// helper: get all handle center points in absolute coords for a node
function getHandlePoints(
  node: InternalNode,
  kind: "source" | "target"
): Array<{ id: string | null; x: number; y: number }> {
  const px = node.internals.positionAbsolute.x;
  const py = node.internals.positionAbsolute.y;

  const bounds = node.internals.handleBounds?.[kind] ?? [];
  // bounds[].x/y are relative to the node's top-left; width/height are the handle box
  return bounds.map((h) => ({
    id: h.id ?? null,
    x: px + h.x + h.width / 2,
    y: py + h.y + h.height / 2,
  }));
}

function dist2(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy; // squared distance (no sqrt needed)
}

export function assignClosestHandles(
  source: InternalNode,
  target: InternalNode
): { sourceHandle?: string | null; targetHandle?: string | null } {
  const sPts = getHandlePoints(source, "source");
  const tPts = getHandlePoints(target, "target");

  if (sPts.length === 0 || tPts.length === 0) {
    return { sourceHandle: undefined, targetHandle: undefined };
    // React Flow will use the node’s default handle.
  }

  let best: {
    sId: string | null;
    tId: string | null;
    d2: number;
  } | null = null;

  for (const s of sPts) {
    for (const t of tPts) {
      const d2 = dist2(s, t);
      if (!best || d2 < best.d2) best = { sId: s.id, tId: t.id, d2 };
    }
  }

  return { sourceHandle: best!.sId, targetHandle: best!.tId };
}
