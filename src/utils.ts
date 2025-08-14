// utils.ts
// ELK-aware layout for React Flow graphs, including edges and multiple handles -> ELK ports.
// Fixed: positions stay RELATIVE for children (no parent offset accumulation).

import ELK from "elkjs/lib/elk.bundled.js";

/**
 * Basic React Flow-ish types (trimmed to what's needed here).
 * If you already import these from @xyflow/react or your own types, you can delete these and use yours.
 */
export type RFNode = {
  id: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  parentId?: string;
  data?: any;
  style?: any;
};

export type RFEdge = {
  id?: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
};

export type Graph = {
  nodes: RFNode[];
  edges: RFEdge[];
};

export type Direction = "RIGHT" | "LEFT" | "DOWN" | "UP";

export type LayoutOptions = {
  /** Main flow direction for the layered algorithm (affects port sides too). */
  direction?: Direction;
  /** Default size for leaf nodes that don't have width/height yet. */
  childDefaultSize?: { width: number; height: number };
  /**
   * Optionally provide size by node id if your nodes don't have width/height
   * (e.g., when rendered virtually or measured later).
   */
  sizeByNode?: (n: RFNode) => { width: number; height: number } | undefined;
  /** Extra padding for compound/group nodes (ELK "elk.padding"). */
  clusterPadding?: string; // e.g., "24" or "24,24,24,24"
  /** Extra layoutOptions to pass straight into the ELK root graph. */
  elkOptionsOverride?: Record<string, string>;
};

/* ----------------------------- ELK type shapes ----------------------------- */

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

/* --------------------------------- Helpers -------------------------------- */

const DEFAULT_CHILD_SIZE = { width: 160, height: 40 };

function sideFor(
  direction: Direction,
  role: "source" | "target"
): "LEFT" | "RIGHT" | "TOP" | "BOTTOM" {
  switch (direction) {
    case "RIGHT":
      return role === "source" ? "RIGHT" : "LEFT";
    case "LEFT":
      return role === "source" ? "LEFT" : "RIGHT";
    case "DOWN":
      return role === "source" ? "BOTTOM" : "TOP";
    case "UP":
      return role === "source" ? "TOP" : "BOTTOM";
  }
}

/**
 * Build a map of nodeId -> ELK ports derived from React Flow edges' sourceHandle/targetHandle.
 * Ports help ELK respect multiple handles per node and reduce crossings.
 */
function collectPorts(raw: Graph, direction: Direction) {
  const byNode: Record<
    string,
    { id: string; properties: Record<string, string> }[]
  > = {};
  const add = (nodeId: string, handleId: string, role: "source" | "target") => {
    if (!handleId) return;
    byNode[nodeId] ||= [];
    const exists = byNode[nodeId].some((p) => p.id === handleId);
    if (!exists) {
      byNode[nodeId].push({
        id: handleId,
        properties: {
          "org.eclipse.elk.port.side": sideFor(direction, role),
        },
      });
    }
  };

  for (const e of raw.edges) {
    if (e.sourceHandle) add(e.source, e.sourceHandle, "source");
    if (e.targetHandle) add(e.target, e.targetHandle, "target");
  }
  return byNode;
}

function mapById<T extends { id: string }>(arr: T[]): Map<string, T> {
  const m = new Map<string, T>();
  for (const it of arr) m.set(it.id, it);
  return m;
}

/* ----------------------------- Public function ---------------------------- */

/**
 * Layout a React Flow graph with ELK (layered). Takes edges into account and
 * respects multiple handles by creating ELK ports.
 *
 * Returns a new Graph with updated node positions and sizes (for groups/compounds).
 * Edges are returned as-is (React Flow will render them normally).
 */
export async function layoutNodesForReactFlow(
  raw: Graph,
  {
    direction = "DOWN",
    childDefaultSize = DEFAULT_CHILD_SIZE,
    sizeByNode,
    clusterPadding,
    elkOptionsOverride,
  }: LayoutOptions = {}
): Promise<Graph> {
  const elk = new ELK();

  // Clone to avoid mutating the caller’s arrays.
  const nodes = raw.nodes.map((n) => ({ ...n, position: { ...n.position } }));
  const edges = raw.edges.map((e) => ({ ...e }));

  const nodeById = mapById(nodes);

  // Build children map (compound support via parentId)
  const childrenOf = new Map<string | undefined, RFNode[]>();
  for (const n of nodes) {
    const key = n.parentId ?? undefined;
    if (!childrenOf.has(key)) childrenOf.set(key, []);
    childrenOf.get(key)!.push(n);
  }

  // Helper to get a leaf node’s size, falling back to defaults or provided callback.
  const getLeafSize = (n: RFNode) => {
    if (sizeByNode) {
      const s = sizeByNode(n);
      if (s) return s;
    }
    return {
      width: n.width ?? childDefaultSize.width,
      height: n.height ?? childDefaultSize.height,
    };
  };

  // Ports derived from handles (only created on nodes that actually use them)
  const portsByNode = collectPorts({ nodes, edges }, direction);

  // Recursively convert into ELK graph structure
  const buildElkSubtree = (parentId?: string): ElkNode[] => {
    const kids = childrenOf.get(parentId) ?? [];
    return kids.map<ElkNode>((n) => {
      const grandkids = childrenOf.get(n.id) ?? [];
      const isCompound = grandkids.length > 0;

      if (isCompound) {
        const elkNode: ElkNode = {
          id: n.id,
          children: buildElkSubtree(n.id),
          layoutOptions: {
            ...(clusterPadding
              ? { "elk.padding": clusterPadding }
              : { "elk.padding": "24" }),
          },
        };
        if (portsByNode[n.id]?.length) {
          elkNode.ports = portsByNode[n.id];
          elkNode.layoutOptions = {
            ...(elkNode.layoutOptions || {}),
            "org.eclipse.elk.portConstraints": "FIXED_ORDER",
          };
        }
        return elkNode;
      }

      const s = getLeafSize(n);
      const elkNode: ElkNode = {
        id: n.id,
        width: s.width,
        height: s.height,
      };
      if (portsByNode[n.id]?.length) {
        elkNode.ports = portsByNode[n.id];
        elkNode.layoutOptions = {
          "org.eclipse.elk.portConstraints": "FIXED_ORDER",
        };
      }
      return elkNode;
    });
  };

  // Convert React Flow edges -> ELK edges
  const elkEdges: ElkEdge[] = edges.map((e) => {
    const src = e.sourceHandle ? `${e.source}:${e.sourceHandle}` : e.source;
    const tgt = e.targetHandle ? `${e.target}:${e.targetHandle}` : e.target;
    return {
      id: e.id ?? `${e.source}-${e.target}`,
      sources: [src],
      targets: [tgt],
    };
  });

  const elkGraph: ElkGraph = {
    id: "root",
    children: buildElkSubtree(undefined),
    edges: elkEdges,
    layoutOptions: {
      // Core algorithm & direction
      "elk.algorithm": "layered",
      "elk.direction": direction,
      // Spacing heuristics
      "elk.spacing.nodeNode": "80",
      "elk.layered.spacing.nodeNodeBetweenLayers": "80",
      "elk.spacing.edgeEdge": "15",
      "elk.spacing.componentComponent": "90",
      // Routing & niceties
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.mergeEdges": "true",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      // Optionally stabilize results if you keep original order meaningful:
      // "elk.layered.considerModelOrder": "NODES_AND_EDGES",
      ...(clusterPadding ? { "elk.padding": clusterPadding } : {}),
      ...(elkOptionsOverride ?? {}),
    },
  };

  // Run ELK
  const layouted = (await elk.layout(elkGraph)) as ElkGraph;

  // Write back positions and sizes.
  // IMPORTANT: React Flow expects:
  // - top-level node positions: absolute (root-relative) -> ELK gives that already
  // - child node positions (with parentId): RELATIVE to their parent -> ELK also gives that already
  // So we *do not* add parent offsets here.
  const applyPositions = (elkNode: ElkNode) => {
    const n = nodeById.get(elkNode.id);

    if (n) {
      n.position = { x: elkNode.x ?? 0, y: elkNode.y ?? 0 };

      // ELK may compute sizes (esp. for compounds). Keep them if present.
      if (elkNode.width != null) n.width = elkNode.width;
      if (elkNode.height != null) n.height = elkNode.height;
    }

    if (elkNode.children?.length) {
      for (const c of elkNode.children) applyPositions(c);
    }
  };

  for (const child of layouted.children ?? []) {
    applyPositions(child);
  }

  // Return updated graph; edges unchanged (RF renders them)
  return { nodes, edges };
}

/* ------------------------------ Convenience ------------------------------- */

/**
 * Small helper to quickly run layout on a plain (nodes, edges) pair.
 */
export async function layout(
  nodes: RFNode[],
  edges: RFEdge[],
  options?: LayoutOptions
): Promise<{ nodes: RFNode[]; edges: RFEdge[] }> {
  const { nodes: nn, edges: ee } = await layoutNodesForReactFlow(
    { nodes, edges },
    options
  );
  return { nodes: nn, edges: ee };
}
