import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import { Box, Flex, Image } from "@chakra-ui/react";
import { VPCLayout, S3_ICONS_URL } from "../constants";

type SubnetData = {
  resource_type: string;
  resource_name: string;
  resource_icon: string;
  is_public: boolean;
  cidr_block: string;
};

type SubnetNode = Node<SubnetData, "resource">;

const Subnet = React.memo(function Subnet({ data }: NodeProps<SubnetNode>) {
  const color = data.is_public ? "#7AA116" : "#00A4A6";
  const label =
    data.resource_name.length > VPCLayout.labelSize
      ? data.resource_name.slice(0, VPCLayout.labelSize)
      : data.resource_name;
  return (
    <Box
      style={{
        border: `1.4px solid ${color}`,
        height: "100%",
        width: "100%",
        borderRadius: "4px",
      }}
    >
      <Flex>
        {/* Image */}
        <Box
          style={{
            width: VPCLayout.imageSize,
            height: VPCLayout.imageSize,
            backgroundColor: color,
          }}
        >
          <Image
            src={`${S3_ICONS_URL}/${data.resource_icon}`}
            alt={data.resource_name}
          />
        </Box>
        {/* Label */}
        <Flex
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: VPCLayout.imageSize,
          }}
        >
          <Box
            style={{
              fontSize: "11px",
              color: "gray",
              paddingLeft: "5px",
              overflow: "hidden",
            }}
          >
            {label}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
});

export default Subnet;
