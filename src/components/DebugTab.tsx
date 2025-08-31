import { Box, Text } from "@chakra-ui/react";
import { JsonViewer } from "@textea/json-viewer";
import { useAppContext } from "../context/AppContext";

export default function DebugTab() {
  const { selectedNodeId, selectedNode, edges } = useAppContext();

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

  // If no node is selected, show empty state
  if (!selectedNodeId) {
    return (
      <Box p={4}>
        <Text>Select a node to view debug information</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Box style={{ fontSize: "13px", marginBottom: "10px" }}>
        ID: <strong>{selectedNodeId}</strong>
      </Box>
      {dataJson}
    </Box>
  );
}
