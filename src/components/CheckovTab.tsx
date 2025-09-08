import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useAppContext } from "../context/AppContext";

interface CheckovCheck {
  check_id: string;
  check_name: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  severity: string;
  file_path: string;
  file_line_range: number[];
  guideline: string;
  details: any[];
  check_class: string;
  evaluated_keys: string[];
}

interface CheckovResource {
  resource_id: string;
  resource_type: string;
  resource_name: string;
  has_issues: boolean;
  check_counts: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  checks: CheckovCheck[];
}

interface CheckovData {
  metadata: {
    graph_name: string;
    total_checks: number;
    total_failed: number;
    total_passed: number;
    total_skipped: number;
    resources_with_issues: number;
  };
  resources: Record<string, CheckovResource>;
  summary: {
    by_status: Record<string, number>;
    by_check_type: Record<string, number>;
    by_file: Record<string, number>;
  };
}

const CheckovTab: React.FC = () => {
  const {
    selectedNodeId,
    setSelectedNodeId,
    checkovDetailedResults: checkovData,
    checkovLoading: loading,
    checkovError: error,
  } = useAppContext();
  const selectedResourceRef = useRef<HTMLDivElement>(null);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Auto-expand resource when node is selected
  useEffect(() => {
    if (selectedNodeId && checkovData?.resources) {
      // Check if the resource exists in Checkov data
      if (checkovData.resources[selectedNodeId]) {
        console.log("Resource found, expanding:", selectedNodeId);
      } else {
        // Try to find a matching resource (case-insensitive or partial match)
        const matchingResource = Object.keys(checkovData.resources).find(
          (key) =>
            key.toLowerCase() === selectedNodeId.toLowerCase() ||
            key.includes(selectedNodeId) ||
            selectedNodeId.includes(key)
        );
      }
    }
  }, [selectedNodeId, checkovData]);

  // Scroll to selected resource when it changes
  useEffect(() => {
    if (selectedNodeId && selectedResourceRef.current) {
      selectedResourceRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedNodeId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASSED":
        return <Icon as={CheckIcon} color="green.500" />;
      case "FAILED":
        return <Icon as={CloseIcon} color="red.500" />;
      case "SKIPPED":
        return <Text color="yellow.500">⏭</Text>;
      default:
        return <Text color="gray.500">?</Text>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PASSED":
        return "green";
      case "FAILED":
        return "red";
      case "SKIPPED":
        return "yellow";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4}>Loading Checkov results...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Text>Error loading Checkov data: {error}</Text>
      </Alert>
    );
  }

  if (!checkovData) {
    return (
      <Box textAlign="center" py={8}>
        <Text>No Checkov data available. Please select a graph first.</Text>
      </Box>
    );
  }

  // Sort resources: those with issues first, then alphabetically
  const sortedResources = Object.values(checkovData.resources).sort((a, b) => {
    if (a.has_issues && !b.has_issues) return -1;
    if (!a.has_issues && b.has_issues) return 1;
    return a.resource_id.localeCompare(b.resource_id);
  });
  {
    /* Debug Info */
  }
  <Box mb={4} p={3} bg="gray.100" borderRadius="md" fontSize="xs">
    <Text fontWeight="bold">Debug Info:</Text>
    <Text>Selected Node ID: {selectedNodeId || "None"}</Text>
    <Text>
      Available Resources: {Object.keys(checkovData.resources).length}
    </Text>
    <Text>Graph Name: {checkovData.metadata.graph_name}</Text>

    {selectedNodeId && !checkovData.resources[selectedNodeId] && (
      <Box mt={2}>
        <Text color="orange.600" fontSize="xs">
          ⚠️ Selected resource not found in Checkov data.
        </Text>
      </Box>
    )}
  </Box>;
  return (
    <Box>
      {/* Summary Header */}
      <Box
        mb={6}
        p={4}
        bg={bgColor}
        borderRadius="md"
        border="1px"
        borderColor={borderColor}
      >
        <VStack align="stretch" spacing={3}>
          <Text fontSize="lg" fontWeight="bold">
            Security Scan Results - {checkovData.metadata.graph_name}
          </Text>

          <HStack justify="space-between">
            <HStack spacing={4}>
              <Badge colorScheme="red" variant="solid">
                {checkovData.metadata.total_failed} Failed
              </Badge>
              <Badge colorScheme="green" variant="solid">
                {checkovData.metadata.total_passed} Passed
              </Badge>
              <Badge colorScheme="yellow" variant="solid">
                {checkovData.metadata.total_skipped} Skipped
              </Badge>
            </HStack>

            <Text fontSize="sm" color="gray.600">
              {checkovData.metadata.resources_with_issues} resources with issues
            </Text>
          </HStack>
        </VStack>
      </Box>

      {/* Resources List */}
      {sortedResources.map((resource, resourceIndex) => (
        <Box
          key={resource.resource_id}
          ref={
            selectedNodeId === resource.resource_id ? selectedResourceRef : null
          }
          border="1px"
          borderColor={
            selectedNodeId === resource.resource_id ? "blue.400" : borderColor
          }
          borderWidth={selectedNodeId === resource.resource_id ? "2px" : "1px"}
          mb={2}
          borderRadius="md"
          bg={
            selectedNodeId === resource.resource_id ? "blue.50" : "transparent"
          }
          position="relative"
        >
          <Box
            p={3}
            bg={resource.has_issues ? "red.50" : "green.50"}
            _hover={{ bg: resource.has_issues ? "red.100" : "green.100" }}
            cursor="pointer"
            onClick={() => {
              // Toggle selection: if already selected, deselect; otherwise select
              if (selectedNodeId === resource.resource_id) {
                setSelectedNodeId(null);
              } else {
                setSelectedNodeId(resource.resource_id);
              }
            }}
          >
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold" fontSize="sm">
                  {resource.resource_name}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  {resource.resource_type}
                </Text>
              </VStack>

              <HStack spacing={2}>
                <Badge
                  colorScheme={resource.has_issues ? "red" : "green"}
                  size="sm"
                >
                  {resource.check_counts.failed} failed
                </Badge>
                <Badge colorScheme="green" size="sm">
                  {resource.check_counts.passed} passed
                </Badge>
                <Text fontSize="xs" color="gray.600">
                  {selectedNodeId === resource.resource_id ? "▼" : "▶"}
                </Text>
              </HStack>
            </HStack>
          </Box>

          {selectedNodeId === resource.resource_id && (
            <Box p={4} bg="white">
              <VStack align="stretch" spacing={3}>
                {/* Resource Summary */}
                <Box p={3} bg="gray.50" borderRadius="md">
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="medium">
                      Check Summary
                    </Text>
                    <Text fontSize="sm">
                      Total: {resource.check_counts.total} | Passed:{" "}
                      {resource.check_counts.passed} | Failed:{" "}
                      {resource.check_counts.failed} | Skipped:{" "}
                      {resource.check_counts.skipped}
                    </Text>
                  </HStack>
                </Box>

                <Divider />

                {/* Individual Checks */}
                {resource.checks.map((check: any, index: number) => (
                  <Box
                    key={`${check.check_id}-${index}`}
                    p={3}
                    border="1px"
                    borderColor={getStatusColor(check.status) + ".200"}
                    borderRadius="md"
                    bg={getStatusColor(check.status) + ".50"}
                  >
                    <VStack align="stretch" spacing={2}>
                      <HStack spacing={3} align="stretch">
                        {/* Status Icon - Stretch to match height of content */}
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          {getStatusIcon(check.status)}
                        </Box>

                        <VStack
                          align="start"
                          spacing={1}
                          flex="1"
                          minW="0"
                          width="100%"
                        >
                          {/* Title with proper overflow handling */}
                          <Box width="100%" position="relative">
                            <Text
                              fontSize="sm"
                              fontWeight="medium"
                              width="100%"
                              wordBreak="break-word"
                              whiteSpace="normal"
                              lineHeight="1.4"
                              pr={check.guideline ? "24px" : "0"}
                              overflowWrap="break-word"
                            >
                              {check.check_name}
                            </Text>
                            {/* Link Icon - Positioned absolutely */}
                            {check.guideline && (
                              <Box
                                as="a"
                                href={check.guideline}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="blue.500"
                                _hover={{ color: "blue.700" }}
                                title="View guideline documentation"
                                position="absolute"
                                top="0"
                                right="0"
                                zIndex={1}
                              >
                                <Icon viewBox="0 0 24 24" boxSize={4}>
                                  <path
                                    fill="currentColor"
                                    d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"
                                  />
                                </Icon>
                              </Box>
                            )}
                          </Box>

                          {/* Metadata Line - Severity and File Location */}
                          <HStack spacing={2} align="center" width="100%">
                            <Badge colorScheme="gray" size="sm" flexShrink={0}>
                              {check.severity}
                            </Badge>
                            <Text fontSize="xs" color="gray.600" flexShrink={0}>
                              {check.file_path}:
                              {check.file_line_range?.[0] || "N/A"}
                            </Text>
                          </HStack>

                          {/* Keys Section - Proper overflow handling */}
                          {check.evaluated_keys &&
                            check.evaluated_keys.length > 0 && (
                              <Box width="100%">
                                <HStack spacing={1} align="start" width="100%">
                                  <Text
                                    fontSize="xs"
                                    fontWeight="medium"
                                    color="gray.600"
                                    flexShrink={0}
                                  >
                                    Keys:
                                  </Text>
                                  <Text
                                    fontSize="xs"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    whiteSpace="nowrap"
                                    flex={1}
                                    minW="0"
                                  >
                                    {check.evaluated_keys.join(", ")}
                                  </Text>
                                </HStack>
                              </Box>
                            )}
                        </VStack>
                      </HStack>

                      {/* Check Details - Only show details if no evaluated keys */}
                      {check.details &&
                        check.details.length > 0 &&
                        !check.evaluated_keys?.length && (
                          <Box pt={2}>
                            <HStack spacing={2}>
                              <Text
                                fontSize="xs"
                                fontWeight="medium"
                                color="gray.600"
                              >
                                Details:
                              </Text>
                              <Text fontSize="xs" noOfLines={2}>
                                {check.details.length === 1
                                  ? check.details[0]
                                  : `${check.details.length} detail items`}
                              </Text>
                            </HStack>
                          </Box>
                        )}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default CheckovTab;
