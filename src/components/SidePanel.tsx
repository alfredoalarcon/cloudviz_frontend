// SidePanel.tsx
import { useEffect } from "react";
import { Box, Button, VStack, Text, IconButton } from "@chakra-ui/react";
import { useAppContext } from "../context/AppContext";
import { JsonViewer } from "@textea/json-viewer";

export default function SidePanel() {
  const {
    selInfoEntity,
    selectedNode,
    edges,
    setSelInfoEntity,
    isPanelOpen,
    setIsPanelOpen,
  } = useAppContext();

  const handleClose = () => {
    setIsPanelOpen(false);
  };

  // --- helpers for sg rules json display ---
  let dataJson = null;

  // Get edges arriving or leaving selectedNode
  const relatedEdges = edges.filter(
    (edge) =>
      edge.source === selectedNode?.id || edge.target === selectedNode?.id
  );

  // Define final JSON to display
  const outData = {
    node: selectedNode,
    edges: relatedEdges,
  };

  if (selectedNode && selectedNode.data) {
    dataJson = (
      <Box borderWidth="1px" borderRadius="md" p={2}>
        <JsonViewer
          style={{ fontSize: "10px" }}
          value={outData}
          rootName={false}
          quotesOnKeys={false}
          displayDataTypes={false}
          displaySize={false}
          defaultInspectDepth={2}
        />
      </Box>
    );
  }

  if (!isPanelOpen) {
    return null;
  }

  // If no entity is selected, show empty state
  if (!selInfoEntity) {
    return (
      <Box
        position="absolute"
        right="0"
        top="0"
        height="100vh"
        width="400px"
        bg="white"
        borderLeft="1px solid"
        borderColor="gray.200"
        boxShadow="lg"
        overflowY="auto"
      >
        <VStack align="stretch" spacing={0} height="100%">
          <Box
            p={4}
            borderBottom="1px solid"
            borderColor="gray.200"
            bg="gray.50"
            position="relative"
          >
            <Text fontSize="lg" fontWeight="bold">
              No selection
            </Text>
            <IconButton
              aria-label="Close details"
              icon={
                <Text fontSize="lg" fontWeight="bold">
                  ×
                </Text>
              }
              size="sm"
              position="absolute"
              top={2}
              right={2}
              onClick={handleClose}
            />
          </Box>
          <Box p={4} flex={1}>
            <Text>Select a node or edge to view details</Text>
          </Box>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      position="absolute"
      right="0"
      top="0"
      height="100vh"
      width="400px"
      bg="white"
      borderLeft="1px solid"
      borderColor="gray.200"
      boxShadow="lg"
      overflowY="auto"
    >
      <VStack align="stretch" spacing={0} height="100%">
        <Box
          p={4}
          borderBottom="1px solid"
          borderColor="gray.200"
          bg="gray.50"
          position="relative"
        >
          <Text fontSize="lg" fontWeight="bold">
            {selInfoEntity.type} details
          </Text>
          <IconButton
            aria-label="Close details"
            icon={
              <Text fontSize="lg" fontWeight="bold">
                ×
              </Text>
            }
            size="sm"
            position="absolute"
            top={2}
            right={2}
            onClick={handleClose}
          />
        </Box>
        <Box p={4} flex={1}>
          <Box style={{ fontSize: "13px", marginBottom: "10px" }}>
            ID: <strong>{selInfoEntity.id}</strong>
          </Box>
          {dataJson}
        </Box>
      </VStack>
    </Box>
  );
}
