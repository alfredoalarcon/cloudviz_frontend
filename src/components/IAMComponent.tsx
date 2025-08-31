import React from "react";
import { NodeProps, Node, Handle, Position, NodeToolbar } from "@xyflow/react";
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
  const {
    setHoveredNodeId,
    setSelectedNodeId,
    selectedNode,
    hoveredNodeId,
    isPanelOpen,
    selectedTab,
    checkovResourceErrors,
  } = useAppContext();

  // Hover state
  const isHovered = hoveredNodeId === id;

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

  // Get Checkov error data for this resource
  const checkovErrorData = checkovResourceErrors?.[id] || null;

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
    <>
      {/* Tooltip definition */}
      <NodeToolbar
        isVisible={isHovered}
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

          {/* Checkov Test Results - Always visible */}
          {checkovErrorData && (
            <Box style={{ fontSize: "9px", marginTop: "4px" }}>
              {(checkovErrorData.passed_count || 0) > 0 && (
                <Box color="green.600" fontWeight="medium">
                  ✓ {checkovErrorData.passed_count || 0} passed
                </Box>
              )}
              {checkovErrorData.failed_count > 0 && (
                <Box color="red.600" fontWeight="medium">
                  ✗ {checkovErrorData.failed_count} failed
                </Box>
              )}
            </Box>
          )}
        </Box>
      </NodeToolbar>
      <Box
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "8px",
          position: "relative",
        }}
      >
        {/* Checkov Passed Tests Indicator (Green) */}
        {(() => {
          if (isPanelOpen && selectedTab === "checkov" && checkovErrorData) {
            const passedCount = checkovErrorData.passed_count || 0;
            if (passedCount > 0) {
              return (
                <Box
                  position="absolute"
                  top="-10px"
                  left="-10px"
                  bg="green.500"
                  color="white"
                  borderRadius="full"
                  width="24px"
                  height="24px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="sm"
                  fontWeight="bold"
                  zIndex={10}
                  title={`${passedCount} passed security checks`}
                  boxShadow="0 2px 4px rgba(0,0,0,0.3)"
                >
                  {passedCount}
                </Box>
              );
            }
          }
          return null;
        })()}

        {/* Checkov Error Indicator Overlay */}
        {isPanelOpen &&
          selectedTab === "checkov" &&
          checkovErrorData &&
          checkovErrorData.has_issues && (
            <Box
              position="absolute"
              top="-10px"
              right="-10px"
              bg="red.500"
              color="white"
              borderRadius="full"
              width="24px"
              height="24px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="sm"
              fontWeight="bold"
              zIndex={10}
              title={`${checkovErrorData.failed_count} errors${
                checkovErrorData.error_details
                  ? `: ${checkovErrorData.error_details}`
                  : ""
              }`}
              boxShadow="0 2px 4px rgba(0,0,0,0.3)"
            >
              {checkovErrorData.failed_count}
            </Box>
          )}
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
            onClick={() => setSelectedNodeId(id)}
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

export default IAMComponent;
