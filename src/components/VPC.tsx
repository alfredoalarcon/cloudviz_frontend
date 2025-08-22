import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import { S3_ICONS_URL } from "../utils/constants";
import GroupContainer from "./GroupContainer";

type VPCData = {
  resource_type: string;
  resource_name: string;
  resource_icon: string;
  cidr_block: string;
  enable_dns_support: boolean;
  enable_dns_hostnames: boolean;
};

type VPCNode = Node<VPCData, "resource">;

const VPCGroup = React.memo(function VPCGroup({
  data,
  id,
}: NodeProps<VPCNode>) {
  const borderColor = "#8C4FFF";
  return (
    <GroupContainer
      borderColor={borderColor}
      borderWidth="1.5px"
      label={data.resource_name}
      imageUrl={`${S3_ICONS_URL}/${data.resource_icon}`}
      id={id}
    />
  );
});

export default VPCGroup;
