import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import { Box, Text } from "@chakra-ui/react";

type ServiceData = {
  resource_type: string;
  resource_name: string;
};

type ServiceNode = Node<ServiceData, "resource">;

const ServiceComponent = React.memo(function ServiceComponent({
  data,
}: NodeProps<ServiceNode>) {
  return (
    <Box
      style={{
        border: "1px solid blue",
        height: "100%",
        width: "100%",
        borderRadius: "8px",
        padding: "1% 2%",
      }}
    >
      <Text style={{ fontSize: "11px" }}>{data.resource_name}</Text>
    </Box>
  );
});

export default ServiceComponent;
