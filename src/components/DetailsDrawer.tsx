// DetailsDrawer.tsx
import * as React from "react";
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useAppContext } from "../context/AppContext";

export default function DetailsDrawer() {
  const { selectedNodeId, setSelectedNodeId } = useAppContext();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Open/close drawer whenever selectedNodeId changes
  React.useEffect(() => {
    if (selectedNodeId) onOpen();
    else onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeId]);

  // Ensure closing the drawer clears the selection
  const handleClose = () => {
    onClose();
    setSelectedNodeId(null);
  };

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
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
