import React from "react";
import { NodeProps, Node, Handle, Position } from "@xyflow/react";
import { Box, Flex, Image } from "@chakra-ui/react";
import { handleStyle, S3_ICONS_URL, resourceLayout } from "../utils/constants";
import { useAppContext } from "../context/AppContext";

type IAMData = {
  resource_type: string;
  resource_name: string;
  resource_icon: string;
  policies: Record<string, Record<string, any>>;
  name: string;
  path: string;
  assume_role_policy: Record<string, string | Record<string, any>[]>;
  tags: string | Record<string, string>;
};

type IAMNode = Node<IAMData, "iam">;
const IAMComponent = React.memo(function IAMComponent({
  data,
  id,
}: NodeProps<IAMNode>) {
  // Context
  const { setHoveredNodeId, setSelInfoEntity, selectedNode } = useAppContext();
  // Compute image size
  const imageSize = resourceLayout.width * resourceLayout.coeff_image;
  const labelHeight = resourceLayout.height - imageSize;

  // Compute label to display
  let label = data.resource_name;
  if (data.resource_name.length > resourceLayout.labelSize) {
    label = data.resource_name.slice(0, resourceLayout.labelSize);
  }

  // Style for selected node
  const selStyle = selectedNode?.id === id ? { border: "3px solid black" } : {};

  // Define handles
  const handles = (
    <>
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
    </>
  );
  return (
    <Box
      style={{
        height: "100%",
        width: "100%",
        borderRadius: "8px",
      }}
    >
      <Flex
        style={{
          height: "100%",
          width: "100%",
          flexDirection: "column",
        }}
      >
        {/* Box holding image */}
        <Box
          style={{
            flexGrow: 0,
            height: imageSize,
            width: imageSize,
            alignSelf: "center",
            flexShrink: 0,
            ...selStyle,
          }}
          onMouseEnter={() => setHoveredNodeId(id)}
          onMouseLeave={() => setHoveredNodeId(null)}
          onClick={() => setSelInfoEntity({ type: "node", id })}
          _hover={{
            border: "3px solid black",
          }}
        >
          <Image
            src={`${S3_ICONS_URL}/${data.resource_icon}`}
            alt={data.resource_name}
          />
        </Box>
        {/* Box holding label */}
        <Flex
          style={{
            flexGrow: 0,
            flexShrink: 0,
            height: labelHeight,
            width: "100%",
            overflow: "hidden",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box
            style={{
              fontSize: resourceLayout.labelFontSize,
              flexGrow: 0,
              alignSelf: "center",
              overflow: "hidden",
            }}
          >
            {label}
          </Box>
        </Flex>
      </Flex>
      {handles}
    </Box>
  );
});

export default IAMComponent;
