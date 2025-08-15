import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import { S3_ICONS_URL } from "../constants";
import GroupContainer from "./GroupContainer";

type SubnetData = {
  resource_type: string;
  resource_name: string;
  resource_icon: string;
  is_public: boolean;
  cidr_block: string;
};

type SubnetNode = Node<SubnetData, "resource">;

const Subnet = React.memo(function Subnet({ data }: NodeProps<SubnetNode>) {
  const borderColor = data.is_public ? "#7AA116" : "#00A4A6";

  return (
    <GroupContainer
      borderColor={borderColor}
      borderWidth="1.2px"
      label={data.resource_name}
      imageUrl={`${S3_ICONS_URL}/${data.resource_icon}`}
    />
  );
});

export default Subnet;
