// DetailsDrawer.tsx
import { useEffect } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Box,
} from "@chakra-ui/react";
import { useAppContext } from "../context/AppContext";
import { JsonViewer } from "@textea/json-viewer";

export default function DetailsDrawer() {
  const { selInfoEntity, selectedNode, edges } = useAppContext();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Open/close drawer whenever selInfoEntity changes
  useEffect(() => {
    if (selInfoEntity) onOpen();
    else onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selInfoEntity]);

  // Ensure closing the drawer clears the selection
  const handleClose = () => {
    onClose();
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

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>{selInfoEntity?.type} details</DrawerHeader>
        <DrawerBody>
          <Box style={{ fontSize: "13px", marginBottom: "10px" }}>
            ID: <strong>{selInfoEntity?.id}</strong>
          </Box>
          {dataJson}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
