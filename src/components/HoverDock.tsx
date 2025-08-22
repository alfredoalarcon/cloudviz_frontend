import { useEffect, useMemo, useState } from "react";
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
  Checkbox,
  Text,
  Select,
  FormControl,
  FormLabel,
  Divider,
  VStack,
} from "@chakra-ui/react";
import { Pin, PinOff, ChevronsUpDown } from "lucide-react";

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
  const {
    displayIam,
    setDisplayIam,
    isResizing,
    setIsResizing,
    graphManifest, // GraphManifest | undefined
    selectedGraphName, // string | null
    setSelectedGraphName, // (name: string) => void
    selGraphType, // "simplified" | "complete"
    setSelGraphType, // (t: "simplified" | "complete") => void
  } = useAppContext();

  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "whiteAlpha.300");
  const [shadowLg] = useToken("shadows", ["lg"]);

  // Options derived from manifest
  const graphNames = useMemo(
    () => (graphManifest?.graphs ?? []).map((g) => g.name),
    [graphManifest]
  );

  const selectedGraph = useMemo(
    () => graphManifest?.graphs.find((g) => g.name === selectedGraphName),
    [graphManifest, selectedGraphName]
  );

  // Availability of graph types for the selected graph
  const hasSimplified = !!selectedGraph?.variants?.["simplified"];
  const hasComplete = !!selectedGraph?.variants?.["complete"];

  // Ensure selGraphType is valid for the selected graph
  useEffect(() => {
    if (!selectedGraph) return;
    if (selGraphType === "simplified" && !hasSimplified && hasComplete) {
      setSelGraphType("complete");
    } else if (selGraphType === "complete" && !hasComplete && hasSimplified) {
      setSelGraphType("simplified");
    } else if (!hasSimplified && !hasComplete) {
      // No known variants: do nothing, leave as-is (consumer should handle)
    }
  }, [
    selectedGraph,
    selGraphType,
    hasSimplified,
    hasComplete,
    setSelGraphType,
  ]);

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
        minW="260px"
        pointerEvents={open ? "auto" : "none"}
        opacity={open ? 1 : 0}
        transform={open ? "translateY(0)" : "translateY(-6px)"}
        transition="opacity 120ms ease, transform 120ms ease"
      >
        <VStack align="stretch" spacing={3}>
          {/* Graph selection */}
          <FormControl>
            <FormLabel mb={1}>Graph</FormLabel>
            <Select
              size="md"
              value={selectedGraphName ?? ""}
              onChange={(e) => setSelectedGraphName(e.target.value)}
              placeholder={
                graphNames.length ? "Select graph..." : "No graphs available"
              }
              isDisabled={!graphNames.length}
            >
              {graphNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Graph type selection */}
          <FormControl as="fieldset">
            <FormLabel mb={1}>Graph type</FormLabel>
            <RadioGroup
              value={selGraphType}
              onChange={(v) => setSelGraphType(v as "simplified" | "complete")}
            >
              <HStack spacing={6}>
                <Radio value="simplified" isDisabled={!hasSimplified}>
                  Simplified
                </Radio>
                <Radio value="complete" isDisabled={!hasComplete}>
                  Complete
                </Radio>
              </HStack>
            </RadioGroup>
          </FormControl>

          <Divider />

          {/* Display IAM */}
          <RadioGroup
            value={displayIam}
            onChange={(v) => setDisplayIam(v as "res-res" | "res-role" | "off")}
          >
            <Box fontSize="lg">Display IAM:</Box>
            <HStack spacing={6}>
              <Radio value="res-res">Resource to Resource</Radio>
              <Radio value="res-role">Resource to Role</Radio>
              <Radio value="off">Off</Radio>
            </HStack>
          </RadioGroup>

          {/* Enable resizing */}
          <Checkbox
            isChecked={isResizing}
            onChange={(e) => setIsResizing(e.target.checked)}
          >
            <Text fontSize="lg">Enable Resizing</Text>
          </Checkbox>
        </VStack>
      </Box>
    </Box>
  );
}
