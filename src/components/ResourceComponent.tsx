import React from "react";
import { NodeProps, Node, Handle, Position, NodeToolbar } from "@xyflow/react";
import { Box, Image, Flex } from "@chakra-ui/react";
import { handleStyle, S3_ICONS_URL, resourceLayout } from "../constants";

type ResourceData = {
  resource_type: string;
  resource_name: string;
  resource_icon: string;
};

type ResourceNode = Node<ResourceData, "resource">;

const ResourceComponent = React.memo(function ResourceComponent({
  id,
  data,
}: NodeProps<ResourceNode>) {
  const [hovered, setHovered] = React.useState(false);

  // Compute image size
  const imageSize = resourceLayout.width * resourceLayout.coeff_image;
  const labelHeight = resourceLayout.height - imageSize;

  // Compute label to display
  let label = data.resource_name;
  if (data.resource_name.length > resourceLayout.labelSize) {
    label = data.resource_name.slice(0, resourceLayout.labelSize);
  }

  // Handles definition
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
    <>
      <NodeToolbar
        isVisible={hovered}
        nodeId={id}
        position={Position.Top}
        offset={8}
      >
        <Box
          px="2"
          py="1"
          fontSize="sm"
          borderRadius="md"
          boxShadow="md"
          bg="white"
        >
          <Box fontWeight="bold" fontSize="10px">
            {data.resource_name}
          </Box>
          <Box opacity={0.8} fontSize="9px">
            {data.resource_type}
          </Box>
        </Box>
      </NodeToolbar>

      <Box
        style={{
          height: "100%",
          width: "100%",
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
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
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
    </>
  );
});

export default ResourceComponent;
