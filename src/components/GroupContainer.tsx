import React from "react";
import { Node } from "@xyflow/react";
import { Box, Flex, Image } from "@chakra-ui/react";
import { GroupLayout } from "../constants";
import { useAppContext } from "../context/AppContext";

type MainContainerData = {
  resource_type: string;
  resource_name: string;
  resource_icon: string;
};

type MainContainerNode = Node<MainContainerData, "resource">;

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
  const [hovered, setHovered] = React.useState(false);
  const { selectedNodeId, setSelectedNodeId } = useAppContext();

  const borderWidthHover =
    (hovered || selectedNodeId === id) && !isService ? "2px" : borderWidth;
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
          onMouseEnter={() => setHovered(isService ? false : true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() =>
            isService ? setSelectedNodeId(null) : setSelectedNodeId(id)
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
