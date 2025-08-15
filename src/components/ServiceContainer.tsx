import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import GroupContainer from "./GroupContainer";
import { S3_ICONS_URL } from "../constants";

type ServiceData = {
  resource_type: string;
  resource_name: string;
  resource_icon: string;
};

type ServiceNode = Node<ServiceData, "resource">;

const ServiceComponent = React.memo(function ServiceComponent({
  data,
  id,
}: NodeProps<ServiceNode>) {
  const borderColor = data.resource_name.toLowerCase().includes("vpc")
    ? "black"
    : "gray";

  const borderWidth = data.resource_name.toLowerCase().includes("vpc")
    ? "1.5px"
    : "1.2px";
  return (
    <GroupContainer
      borderColor={borderColor}
      label={data.resource_name}
      imageUrl={`${S3_ICONS_URL}/${data.resource_icon}`}
      borderWidth={borderWidth}
      id={id}
      isService={true}
    />
  );
});

export default ServiceComponent;
