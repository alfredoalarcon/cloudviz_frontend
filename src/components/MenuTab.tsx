import { useEffect, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Box,
  HStack,
  RadioGroup,
  Radio,
  Checkbox,
  Text,
  Select,
  FormControl,
  FormLabel,
  Divider,
  VStack,
} from "@chakra-ui/react";

export default function MenuTab() {
  const {
    displayIam,
    setDisplayIam,
    isResizing,
    setIsResizing,
    graphManifest,
    selectedGraphName,
    setSelectedGraphName,
    selGraphType,
    setSelGraphType,
    displayEdgeLabels,
    setDisplayEdgeLabels,
  } = useAppContext();

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

  return (
    <Box p={4}>
      <VStack align="stretch" spacing={4}>
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

        {/* Display Edge Labels */}
        <Checkbox
          isChecked={displayEdgeLabels}
          onChange={(e) => setDisplayEdgeLabels(e.target.checked)}
        >
          <Text fontSize="lg">Display Edge Labels</Text>
        </Checkbox>

        {/* Enable resizing */}
        <Checkbox
          isChecked={isResizing}
          onChange={(e) => setIsResizing(e.target.checked)}
        >
          <Text fontSize="lg">Enable Resizing</Text>
        </Checkbox>
      </VStack>
    </Box>
  );
}
