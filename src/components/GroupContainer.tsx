import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import { Box, Flex, Image } from "@chakra-ui/react";
import { S3_ICONS_URL, GroupLayout } from "../constants";

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
}: {
  borderColor: string;
  label: string;
  imageUrl: string;
  borderWidth: string;
}) {
  return (
    <Box
      style={{
        border: `${borderWidth} solid ${borderColor}`,
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
