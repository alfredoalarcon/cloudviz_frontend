import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import { S3_ICONS_URL } from "../utils/constants";
import GroupContainer from "./GroupContainer";

type MainContainerData = {
  resource_type: string;
  resource_name: string;
  resource_icon: string;
};

type MainContainerNode = Node<MainContainerData, "resource">;

const MainContainerComponent = React.memo(function MainContainerComponent({
  id,
  data,
}: NodeProps<MainContainerNode>) {
  return (
    <GroupContainer
      borderWidth="1.5px"
      borderColor="#1d1d1dff"
      label={data.resource_name}
      imageUrl={`${S3_ICONS_URL}/${data.resource_icon}`}
      id={id}
      isService={true}
    />
  );
});

export default MainContainerComponent;
