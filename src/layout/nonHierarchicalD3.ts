// layoutWithD3.ts
import type { Node, Edge, XYPosition } from "@xyflow/react";
import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceCollide,
  SimulationNodeDatum,
} from "d3-force";

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

function applyPositionsToNodes(
  nodes: Node[],
  positions: Record<string, XYPosition>
): Node[] {
  return nodes.map((n) =>
    positions[n.id] ? { ...n, position: positions[n.id] } : n
  );
}

export type D3Options = {
  chargeStrength?: number;
  linkDistance?:
    | number
    | ((edge: { source: string; target: string }) => number);
  linkStrength?: number; // 0..1
  collidePadding?: number;
  iterations?: number;
  center?: { x?: number; y?: number };
};

export async function layoutNodesWithD3(
  nodes: Node[],
  edges: Edge[],
  viewport: Viewport,
  options: D3Options = {}
): Promise<Node[]> {
  const sizes = collectSizes(nodes);

  type SimNode = SimulationNodeDatum & {
    id: string;
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
  const simNodes: SimNode[] = nodes.map((n) => ({
    id: n.id,
    width: sizes[n.id].w,
    height: sizes[n.id].h,
    x: Math.random() * 400,
    y: Math.random() * 300,
  }));

  const byId = new Map(simNodes.map((n) => [n.id, n]));
  const simLinks = edges
    .filter((e) => byId.has(String(e.source)) && byId.has(String(e.target)))
    .map((e, i) => ({
      id: e.id ?? `e-${i}`,
      source: byId.get(String(e.source))!,
      target: byId.get(String(e.target))!,
    }));

  const {
    chargeStrength = -400,
    linkDistance = 120,
    linkStrength = 0.8,
    collidePadding = 12,
    iterations = 300,
    center = {},
  } = options;

  const sim = forceSimulation<SimNode>(simNodes)
    .force("charge", forceManyBody().strength(chargeStrength))
    .force(
      "link",
      forceLink<SimNode, any>(simLinks)
        .id((d) => d.id)
        .distance(
          typeof linkDistance === "function"
            ? (d: any) => linkDistance(d)
            : linkDistance
        )
        .strength(linkStrength)
    )
    .force(
      "collide",
      forceCollide<SimNode>().radius((d) => {
        const halfDiagonal = Math.sqrt(
          (d.width / 2) ** 2 + (d.height / 2) ** 2
        );
        return halfDiagonal + collidePadding;
      })
    )
    .force("center", forceCenter(center.x ?? 0, center.y ?? 0))
    .stop();

  sim.tick(iterations);

  const positions: Record<string, XYPosition> = {};
  for (const d of simNodes) {
    const x = (d.x ?? 0) - d.width / 2;
    const y = (d.y ?? 0) - d.height / 2;
    positions[d.id] = { x, y };
  }

  const fitted = fitToViewport(positions, sizes, viewport);
  return applyPositionsToNodes(nodes, fitted);
}
