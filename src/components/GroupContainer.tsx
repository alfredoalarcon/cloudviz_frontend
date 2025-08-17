import React from "react";
import { Box, Flex, Image } from "@chakra-ui/react";
import { GroupLayout } from "../constants";
import { useAppContext } from "../context/AppContext";

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
  const { setSelInfoEntity, selectedNode, hoveredNodeId, setHoveredNodeId } =
    useAppContext();

  // Hover state
  const isHovered = hoveredNodeId === id;

  // Set border width considering hover and selection
  const borderWidthHover =
    (isHovered || selectedNode?.id === id) && !isService ? "2px" : borderWidth;
  return (
    <Box
      style={{
        border: `${borderWidthHover} solid ${borderColor}`,
        height: "100%",
        width: "100%",
        borderRadius: "4px",
      }}
    >
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
          onClick={() =>
            isService
              ? setSelInfoEntity(null)
              : setSelInfoEntity({ type: "node", id })
          }
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
  );
});

export default GroupContainer;
