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
  let rulesJson = null;

  if (selectedNode && selectedNode.data.has_security_groups) {
    rulesJson = (
      <Box>
        <h2>Security Group Rules:</h2>
        <Box borderWidth="1px" borderRadius="md" p={2}>
          <JsonViewer
            value={selectedNode.data.sg_rules}
            rootName={false}
            enableClipboard={false}
            quotesOnKeys={false}
            displayDataTypes={false}
            displaySize={false}
          />
        </Box>
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
          {selectedNodeId ? (
            <div>
              <b>ID:</b> {selectedNodeId}
              {/* Fetch/render more info about the node here */}
            </div>
          ) : null}

          {rulesJson}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
