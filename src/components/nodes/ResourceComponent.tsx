import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import { Box, Text } from "@chakra-ui/react";

type ResourceData = {
  resource_type: string;
  resource_name: string;
};

type ResourceNode = Node<ResourceData, "resource">;

const ResourceComponent = React.memo(function ResourceComponent({
  data,
}: NodeProps<ResourceNode>) {
  return (
    <Box
      style={{
        border: "1px solid green",
        height: "100%",
        width: "100%",
        borderRadius: "8px",
      }}
    >
      <Text style={{ fontSize: "8px", padding: "1% 2%" }}>
        {data.resource_name}
      </Text>
    </Box>
  );
});

export default ResourceComponent;
