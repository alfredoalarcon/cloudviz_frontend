import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import { Box, Flex, Image } from "@chakra-ui/react";
import { VPCLayout, S3_ICONS_URL } from "../constants";

type VPCData = {
  resource_type: string;
  resource_name: string;
  resource_icon: string;
  cidr_block: string;
  enable_dns_support: boolean;
  enable_dns_hostnames: boolean;
};

type VPCNode = Node<VPCData, "resource">;

const VPCGroup = React.memo(function VPCGroup({ data }: NodeProps<VPCNode>) {
  const color = "#8C4FFF";
  const label =
    data.resource_name.length > VPCLayout.labelSize
      ? data.resource_name.slice(0, VPCLayout.labelSize)
      : data.resource_name;
  return (
    <Box
      style={{
        border: `1.6px solid ${color}`,
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
        <Flex style={{ flexDirection: "column", justifyContent: "center" }}>
          <Box
            style={{
              fontSize: "13px",
              color: "gray",
              paddingLeft: "5px",
            }}
          >
            {label}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
});

export default VPCGroup;
