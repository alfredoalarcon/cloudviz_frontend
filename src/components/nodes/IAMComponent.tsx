import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import { Box, Text } from "@chakra-ui/react";

type IAMData = {
  resource_type: string;
  resource_name: string;
  policies: Record<string, Record<string, any>>;
  name: string;
  path: string;
  assume_role_policy: Record<string, string | Record<string, any>[]>;
  tags: string | Record<string, string>;
};

type IAMNode = Node<IAMData, "iam">;
const IAMComponent = React.memo(function IAMComponent({
  id,
}: NodeProps<IAMNode>) {
  return (
    <Box
      style={{
        border: "1px solid black",
        height: "100%",
        width: "100%",
        borderRadius: "8px",
      }}
    >
      <Text style={{ fontSize: "5px" }}>{id}</Text>
    </Box>
  );
});

export default IAMComponent;
