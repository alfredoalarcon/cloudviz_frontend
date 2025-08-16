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
  const { selectedNodeId, setSelectedNodeId, selectedNode } = useAppContext();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Open/close drawer whenever selectedNodeId changes
  useEffect(() => {
    if (selectedNodeId) onOpen();
    else onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeId]);

  // Ensure closing the drawer clears the selection
  const handleClose = () => {
    onClose();
    setSelectedNodeId(null);
  };

  // --- helpers for sg rules json display ---
  let dataJson = null;

  if (selectedNode && selectedNode.data) {
    dataJson = (
      <Box borderWidth="1px" borderRadius="md" p={2}>
        <JsonViewer
          style={{ fontSize: "10px" }}
          value={selectedNode.data}
          rootName={false}
          enableClipboard={false}
          quotesOnKeys={false}
          displayDataTypes={false}
          displaySize={false}
        />
      </Box>
    );
  }

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Node details</DrawerHeader>
        <DrawerBody>
          <Box style={{ fontSize: "13px", marginBottom: "10px" }}>
            ID: <strong>{selectedNodeId}</strong>
          </Box>
          {dataJson}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
