import React from "react";
import { NodeProps, Node, Handle, Position } from "@xyflow/react";
import { Box, Text } from "@chakra-ui/react";
import { handleStyle } from "../../constants";

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

      <Handle
        id="top"
        type="source"
        position={Position.Top}
        style={handleStyle}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        style={handleStyle}
      />
      <Handle
        id="bottom"
        type="target"
        position={Position.Bottom}
        style={handleStyle}
      />
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        style={handleStyle}
      />
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        style={handleStyle}
      />
      <Handle
        id="right"
        type="target"
        position={Position.Right}
        style={handleStyle}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        style={handleStyle}
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        style={handleStyle}
      />
    </Box>
  );
});

export default IAMComponent;
