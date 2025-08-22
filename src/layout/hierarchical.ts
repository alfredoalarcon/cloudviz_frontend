// utils.ts
// ELK-aware layout for React Flow graphs, including edges and multiple handles -> ELK ports.
// Fixed: positions stay RELATIVE for children (no parent offset accumulation).
// Hidden nodes are excluded from ELK but kept in the return value with a placeholder position (required by React Flow).
// If some parentId has no corresponding visible parent (missing or hidden), we create ELK-only virtual groups.

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
  sources: string[];
  targets: string[];
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
  const isHidden = (n: Node) => Boolean((n as any).hidden);

  // compute aspect ratio from viewport
  let aspectRatio: number | undefined;
  if (viewportSize?.width && viewportSize?.height) {
    aspectRatio = (1.3 * viewportSize.width) / viewportSize.height;
  } else if (
    typeof window !== "undefined" &&
    window.innerWidth &&
    window.innerHeight
  ) {
    aspectRatio = (1.3 * window.innerWidth) / window.innerHeight;
  }

  // Clone to avoid mutating the caller’s arrays.
  // IMPORTANT: Keep position on ALL nodes to satisfy React Flow typing & runtime.
  const nodes = raw.nodes.map((n) => ({
    ...n,
    position: n.position ?? { x: 0, y: 0 },
  }));
  const edges = raw.edges.map((e) => ({ ...e }));

  const nodeById = mapById(nodes);

  // Build children map for VISIBLE nodes only (hidden are excluded from ELK).
  const childrenOfVisible = new Map<string | undefined, Node[]>();
  for (const n of nodes) {
    if (isHidden(n)) continue;
    const key = n.parentId ?? undefined;
    if (!childrenOfVisible.has(key)) childrenOfVisible.set(key, []);
    childrenOfVisible.get(key)!.push(n);
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
    const kids = childrenOfVisible.get(parentId) ?? [];
    return kids.map<ElkNode>((n) => {
      const grandkids = childrenOfVisible.get(n.id) ?? [];
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

  // ELK edges: include ONLY if BOTH endpoints exist and are visible.
  const elkEdges: ElkEdge[] = edges
    .filter((e) => {
      const s = nodeById.get(e.source);
      const t = nodeById.get(e.target);
      if (!s || !t) return false;
      return !isHidden(s) && !isHidden(t);
    })
    .map((e) => ({
      id: e.id ?? `${e.source}-${e.target}`,
      sources: [e.source],
      targets: [e.target],
    }));

  // Virtual parents for missing or hidden parents of visible nodes.
  const referencedParents = Array.from(childrenOfVisible.keys()).filter(
    (k): k is string => typeof k === "string"
  );
  const virtualParentIds = referencedParents.filter((pid) => {
    const p = nodeById.get(pid);
    return !p || isHidden(p);
  });
  const hasVirtualParents = virtualParentIds.length > 0;

  const rootChildren: ElkNode[] = [];
  rootChildren.push(...buildElkSubtree(undefined));

  if (hasVirtualParents) {
    for (const vpid of virtualParentIds) {
      const kids = childrenOfVisible.get(vpid) ?? [];
      if (kids.length === 0) continue;

      const compoundKids: ElkNode[] = kids.map((n) => {
        const grand = childrenOfVisible.get(n.id) ?? [];
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
        id: `__virtual__${vpid}`,
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
    children: hasVirtualParents ? rootChildren : buildElkSubtree(undefined),
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

  // Write back positions/sizes for visible nodes included in ELK.
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

  // NOTE: Do NOT remove 'position' from hidden nodes — React Flow requires it.
  // If you truly must strip it for storage, do it AFTER calling React Flow (not before).

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

function getHandlePoints(
  node: InternalNode,
  kind: "source" | "target"
): Array<{ id: string | null; x: number; y: number }> {
  const px = node.internals.positionAbsolute.x;
  const py = node.internals.positionAbsolute.y;

  const bounds = node.internals.handleBounds?.[kind] ?? [];
  return bounds.map((h) => ({
    id: h.id ?? null,
    x: px + h.x + h.width / 2,
    y: py + h.y + h.height / 2,
  }));
}

function dist2(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function assignClosestHandles(
  source: InternalNode,
  target: InternalNode
): { sourceHandle?: string | null; targetHandle?: string | null } {
  const sPts = getHandlePoints(source, "source");
  const tPts = getHandlePoints(target, "target");

  if (sPts.length === 0 || tPts.length === 0) {
    return { sourceHandle: undefined, targetHandle: undefined };
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
