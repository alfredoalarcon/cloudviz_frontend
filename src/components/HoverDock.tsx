import { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Box,
  IconButton,
  useToken,
  HStack,
  RadioGroup,
  Radio,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { Pin, PinOff, ChevronsUpDown } from "lucide-react"; // or any icon set you use

type DockPosition = {
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
};

type HoverDockProps = {
  position?: DockPosition;
  initialPinned?: boolean;
};

export default function HoverDock({
  position = { top: 16, left: 16 },
  initialPinned = false,
}: HoverDockProps) {
  const [pinned, setPinned] = useState(initialPinned);
  const [hovered, setHovered] = useState(false);
  const [focusedWithin, setFocusedWithin] = useState(false);

  // Context
  const { displayIam, setDisplayIam } = useAppContext();

  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "whiteAlpha.300");
  const [shadowLg] = useToken("shadows", ["lg"]);

  // Open when pinned OR hovered OR focus is inside (keyboard a11y)
  const open = useMemo(
    () => pinned || hovered || focusedWithin,
    [pinned, hovered, focusedWithin]
  );

  return (
    <Box
      position="fixed"
      zIndex={1000}
      {...position}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocusedWithin(true)}
      onBlurCapture={() => setFocusedWithin(false)}
    >
      {/* Collapsed pill (always visible) */}
      <HStack spacing={2}>
        <Tooltip label={pinned ? "Unpin" : "Pin"} hasArrow>
          <IconButton
            aria-label={pinned ? "Unpin toolbar" : "Pin toolbar"}
            size="sm"
            onClick={() => setPinned((v) => !v)}
            icon={pinned ? <PinOff size={16} /> : <Pin size={16} />}
            variant="ghost"
          />
        </Tooltip>

        {!open && (
          <Tooltip label="Open controls" hasArrow>
            <IconButton
              aria-label="Open controls"
              size="sm"
              icon={<ChevronsUpDown size={16} />}
              variant="solid"
              onClick={() => setHovered(true)} // click also opens for touch users
            />
          </Tooltip>
        )}
      </HStack>

      {/* Expanded panel */}
      <Box
        mt={2}
        bg={bg}
        borderWidth="1px"
        borderColor={border}
        borderRadius="md"
        boxShadow={shadowLg}
        p={3}
        minW="220px"
        pointerEvents={open ? "auto" : "none"}
        opacity={open ? 1 : 0}
        transform={open ? "translateY(0)" : "translateY(-6px)"}
        transition="opacity 120ms ease, transform 120ms ease"
      >
        <RadioGroup
          value={displayIam}
          onChange={(v) => setDisplayIam(v as "res-res" | "res-role" | "off")}
        >
          <Box fontSize={"lg"}>Display IAM:</Box>
          <HStack spacing={6}>
            <Radio value="res-res">Resource to Resource</Radio>
            <Radio value="res-role">Resource to Role</Radio>
            <Radio value="off">Off</Radio>
          </HStack>
        </RadioGroup>
      </Box>
    </Box>
  );
}
