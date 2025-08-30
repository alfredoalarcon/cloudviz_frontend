import { IconButton, Box } from "@chakra-ui/react";
import { Menu } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function FloatingPanelButton() {
  const { isPanelOpen, setIsPanelOpen } = useAppContext();

  // Only show when panel is closed
  if (isPanelOpen) {
    return null;
  }

  const handleOpenPanel = () => {
    setIsPanelOpen(true);
  };

  return (
    <Box position="fixed" right="20px" top="20px" zIndex={1000}>
      <IconButton
        aria-label="Open menu"
        icon={<Menu size={24} />}
        onClick={handleOpenPanel}
        size="lg"
        colorScheme="gray"
        borderRadius="full"
        boxShadow="lg"
        _hover={{
          transform: "scale(1.1)",
          boxShadow: "xl",
        }}
        transition="all 0.2s ease-in-out"
      />
    </Box>
  );
}
