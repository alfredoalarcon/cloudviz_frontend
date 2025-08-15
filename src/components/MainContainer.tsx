import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import { Box } from "@chakra-ui/react";

type MainContainerData = {
  resource_type: string;
  resource_name: string;
};

type MainContainerNode = Node<MainContainerData, "resource">;

const MainContainerComponent = React.memo(function MainContainerComponent({
  id,
}: NodeProps<MainContainerNode>) {
  return (
    <Box
      style={{
        border: "1px solid blue",
        height: "100%",
        width: "100%",
        borderRadius: "8px",
      }}
    >
      {id}
    </Box>
  );
});

export default MainContainerComponent;
