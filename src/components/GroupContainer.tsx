import React from "react";
import { Box, Flex, Image } from "@chakra-ui/react";
import { GroupLayout } from "../utils/constants";
import { useAppContext } from "../context/AppContext";
import { NodeResizer } from "@xyflow/react";

const GroupContainer = React.memo(function GroupContainer({
  borderColor,
  label,
  imageUrl,
  borderWidth,
  id,
  isService = false,
}: {
  borderColor: string;
  label: string;
  imageUrl: string;
  borderWidth: string;
  isService?: boolean;
  id: string;
}) {
  // Context
  const {
    setSelectedNodeId,
    selectedNode,
    hoveredNodeId,
    setHoveredNodeId,
    isResizing,
    isPanelOpen,
    selectedTab,
    checkovResourceErrors,
  } = useAppContext();

  // Hover state
  const isHovered = hoveredNodeId === id;
  const isSelected = selectedNode?.id === id;

  // Set border width considering hover and selection
  const borderWidthHover =
    (isHovered || isSelected) && !isService ? "2px" : borderWidth;

  // Get Checkov error data for this resource
  const checkovErrorData = checkovResourceErrors?.[id] || null;

  return (
    <>
      <NodeResizer
        isVisible={isResizing}
        color={borderColor}
        handleStyle={{
          height: GroupLayout.resizeHandlerSize,
          width: GroupLayout.resizeHandlerSize,
          color: borderColor,
        }}
      />
      <Box
        style={{
          border: `${borderWidthHover} solid ${borderColor}`,
          height: "100%",
          width: "100%",
          borderRadius: "4px",
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
        <Flex>
          {/* Image */}
          <Box
            style={{
              width: GroupLayout.imageSize,
              height: GroupLayout.imageSize,
              flexShrink: 0,
            }}
            onMouseEnter={() => setHoveredNodeId(isService ? null : id)}
            onMouseLeave={() => setHoveredNodeId(null)}
            onClick={() => setSelectedNodeId(id)}
          >
            <Image src={imageUrl} alt={label} />
          </Box>
          {/* Label */}
          <Flex
            style={{
              flexDirection: "column",
              justifyContent: "center",
              // disallows overflow of children elements
              minWidth: 0,
            }}
          >
            <Box
              style={{
                fontSize: "13px",
                color: "gray",
                paddingLeft: "5px",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </Box>
          </Flex>
        </Flex>
      </Box>
    </>
  );
});

export default GroupContainer;
