import React from "react";
import { NodeProps, Node, Handle, Position } from "@xyflow/react";
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

      <Handle id="top" type="source" position={Position.Top} />
      <Handle id="right" type="source" position={Position.Right} />
      <Handle id="bottom" type="target" position={Position.Bottom} />
      <Handle id="left" type="target" position={Position.Left} />
      <Handle id="top" type="target" position={Position.Top} />
      <Handle id="right" type="target" position={Position.Right} />
      <Handle id="bottom" type="source" position={Position.Bottom} />
      <Handle id="left" type="source" position={Position.Left} />
    </Box>
  );
});

export default ResourceComponent;
