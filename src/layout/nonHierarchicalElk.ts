// layoutWithElk.ts
import type { Node, Edge, XYPosition } from "@xyflow/react";
import ELK, {
  ElkNode,
  ElkExtendedEdge,
  LayoutOptions as ElkLayoutOptions,
} from "elkjs/lib/elk.bundled.js";

export type Viewport = { width: number; height: number; padding?: number };

const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 60;
const DEFAULT_PADDING = 24;

function collectSizes(nodes: Node[]): Record<string, { w: number; h: number }> {
  const sizes: Record<string, { w: number; h: number }> = {};
  for (const n of nodes) {
    const w =
      (n.width as number) ??
      (n.style && (n.style as any).width) ??
      DEFAULT_NODE_WIDTH;
    const h =
      (n.height as number) ??
      (n.style && (n.style as any).height) ??
      DEFAULT_NODE_HEIGHT;
    sizes[n.id] = { w: Number(w), h: Number(h) };
  }
  return sizes;
}

function applyPositionsToNodes(
  nodes: Node[],
  positions: Record<string, XYPosition>
): Node[] {
  return nodes.map((n) =>
    positions[n.id] ? { ...n, position: positions[n.id] } : n
  );
}

function computeBBox(
  positions: Record<string, XYPosition>,
  sizes: Record<string, { w: number; h: number }>
) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const id of Object.keys(positions)) {
    const p = positions[id];
    const s = sizes[id];
    const l = p.x,
      t = p.y,
      r = p.x + s.w,
      b = p.y + s.h;
    if (l < minX) minX = l;
    if (t < minY) minY = t;
    if (r > maxX) maxX = r;
    if (b > maxY) maxY = b;
  }
  if (!isFinite(minX)) return { minX: 0, minY: 0, width: 1, height: 1 };
  return { minX, minY, width: maxX - minX, height: maxY - minY };
}

function fitToViewport(
  positions: Record<string, XYPosition>,
  sizes: Record<string, { w: number; h: number }>,
  viewport: Viewport
) {
  const padding = viewport.padding ?? DEFAULT_PADDING;
  const vw = Math.max(1, viewport.width - 2 * padding);
  const vh = Math.max(1, viewport.height - 2 * padding);
  const bbox = computeBBox(positions, sizes);
  const s = Math.min(
    vw / Math.max(1, bbox.width),
    vh / Math.max(1, bbox.height)
  );
  const scaledW = bbox.width * s;
  const scaledH = bbox.height * s;
  const offX = padding + (vw - scaledW) / 2 - bbox.minX * s;
  const offY = padding + (vh - scaledH) / 2 - bbox.minY * s;
  const out: Record<string, XYPosition> = {};
  for (const id of Object.keys(positions)) {
    const p = positions[id];
    out[id] = { x: p.x * s + offX, y: p.y * s + offY };
  }
  return out;
}

export type ElkOptions = {
  elkOptions?: Partial<ElkLayoutOptions>;
  direction?: "DOWN" | "UP" | "RIGHT" | "LEFT";
  nodeNodeSpacing?: number;
  edgeNodeSpacing?: number;
  edgeEdgeSpacing?: number;
};

export async function layoutNodesWithElk(
  nodes: Node[],
  edges: Edge[],
  viewport: Viewport,
  options: ElkOptions = {}
): Promise<Node[]> {
  const sizes = collectSizes(nodes);
  const elk = new ELK();

  const elkNodes: ElkNode[] = nodes.map((n) => ({
    id: n.id,
    width: sizes[n.id].w,
    height: sizes[n.id].h,
  }));

  const elkEdges: ElkExtendedEdge[] = edges.map((e, i) => ({
    id: e.id ?? `e-${i}`,
    sources: [String(e.source)],
    targets: [String(e.target)],
  }));

  const {
    elkOptions: userElkOpts = {},
    direction = "RIGHT",
    nodeNodeSpacing = 40,
    edgeNodeSpacing = 20,
    edgeEdgeSpacing = 10,
  } = options;

  const elkLayoutOptions: ElkLayoutOptions = {
    "elk.algorithm": "layered",
    "elk.direction": direction,
    "elk.spacing.nodeNode": `${nodeNodeSpacing}`,
    "elk.spacing.edgeNode": `${edgeNodeSpacing}`,
    "elk.spacing.edgeEdge": `${edgeEdgeSpacing}`,
    "elk.layered.spacing.nodeNodeBetweenLayers": "40",
    "elk.layered.nodePlacement.favorStraightEdges": "true",
    ...userElkOpts,
  };

  const res = await elk.layout({
    id: "root",
    layoutOptions: elkLayoutOptions,
    children: elkNodes,
    edges: elkEdges,
  });

  const positions: Record<string, XYPosition> = {};
  for (const c of res.children ?? [])
    positions[c.id] = { x: c.x ?? 0, y: c.y ?? 0 };

  const fitted = fitToViewport(positions, sizes, viewport);
  return applyPositionsToNodes(nodes, fitted);
}
