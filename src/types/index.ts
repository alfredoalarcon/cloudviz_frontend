import { Edge, Node } from "@xyflow/react";

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
