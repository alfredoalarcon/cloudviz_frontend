import { Edge, Node } from "@xyflow/react";

export type graphType = "complete" | "simplified";

export type Graph = {
  nodes: Node[];
  edges: Edge[];
};

export type SgRule = {
  type: "ingress" | "egress";
  from_port: number;
  to_port: number;
  protocol: string; // "-1" means "all"
  cidr_blocks?: string[];
  sg_id: string;
};

export type GraphManifest = {
  graphs: Array<{ name: string; variants: { [key: string]: string } }>;
};
