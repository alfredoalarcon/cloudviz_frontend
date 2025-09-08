import React from "react";
import { NodeProps, Node, Handle, Position, NodeToolbar } from "@xyflow/react";
import { Box, Image, Flex } from "@chakra-ui/react";
import {
  handleStyle,
  S3_ICONS_URL,
  resourceLayout,
  nonHierarchicalNodeLayout,
} from "../utils/constants";
import { useAppContext } from "../context/AppContext";
import { SgRule } from "../utils/types";

type ResourceData = {
  resource_type: string;
  resource_name: string;
  resource_icon: string;
  has_security_groups?: boolean;
  sg_rules?: SgRule[];
};

type ResourceNode = Node<ResourceData, "resource">;

const ResourceComponent = React.memo(function ResourceComponent({
  id,
  data,
}: NodeProps<ResourceNode>) {
  // Context
  const {
    setSelectedNodeId,
    selectedNode,
    hoveredNodeId,
    setHoveredNodeId,
    selGraphType,
    isPanelOpen,
    selectedTab,
    checkovResourceErrors,
  } = useAppContext();

  // Choose layout
  const layout =
    selGraphType === "complete" ? nonHierarchicalNodeLayout : resourceLayout;

  // Hover state
  const isHovered = hoveredNodeId === id;

  // Compute image size
  const imageSize = layout.width * layout.coeff_image;
  const labelHeight = layout.height - imageSize;

  // Compute label to display
  let label = data.resource_name;
  if (data.resource_name.length > layout.labelSize) {
    label = data.resource_name.slice(0, layout.labelSize);
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

  // Style for selected node
  const selStyle = selectedNode?.id === id ? { border: "3px solid black" } : {};

  // Style if it has a security group
  const sgStyle = data.has_security_groups ? { border: "0.5px solid red" } : {};

  // Get Checkov error data for this resource
  const checkovErrorData = checkovResourceErrors?.[id] || null;

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
          <Box style={{ fontSize: "9px", marginTop: "4px", opacity: 0.8 }}>
            {data.has_security_groups ? "✓ Security Groups" : null}
          </Box>

          {/* Checkov Test Results - Always visible */}
          {checkovErrorData && (
            <Box style={{ fontSize: "9px", marginTop: "4px" }}>
              {(checkovErrorData.passed_count || 0) > 0 && (
                <Box color="green.600" fontWeight="medium">
                  ✓ {checkovErrorData.passed_count || 0} passed
                </Box>
              )}
              {(checkovErrorData.failed_count || 0) > 0 && (
                <Box color="red.600" fontWeight="medium">
                  ✗ {checkovErrorData.failed_count || 0} failed
                </Box>
              )}
            </Box>
          )}
        </Box>
      </NodeToolbar>

      {/* Main definition of resource */}
      <Box
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
          ...sgStyle,
        }}
      >
        {/* Checkov Error Indicator Overlay */}

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

        {/* Checkov Error Indicator (Red) */}
        {(() => {
          return (
            isPanelOpen &&
            selectedTab === "checkov" &&
            checkovErrorData &&
            checkovErrorData.has_issues
          );
        })() &&
          checkovErrorData && (
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
                fontSize: layout.labelFontSize,
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
