// SidePanel.tsx
import {
  Box,
  VStack,
  Text,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { useAppContext } from "../context/AppContext";
import DebugTab from "./DebugTab";
import MenuTab from "./MenuTab";
import CheckovTab from "./CheckovTab";

export default function SidePanel() {
  const {
    selectedNodeId,
    isPanelOpen,
    setIsPanelOpen,
    selectedTab,
    setSelectedTab,
  } = useAppContext();

  const handleClose = () => {
    setIsPanelOpen(false);
  };

  if (!isPanelOpen) {
    return null;
  }

  return (
    <Box
      position="absolute"
      right="0"
      top="0"
      height="100vh"
      width="400px"
      bg="white"
      borderLeft="1px solid"
      borderColor="gray.200"
      boxShadow="lg"
      display="flex"
      flexDirection="column"
    >
      {/* Fixed Header with Tabs */}
      <Box
        p={4}
        borderBottom="1px solid"
        borderColor="gray.200"
        bg="gray.50"
        flexShrink={0}
        position="relative"
      >
        <Text fontSize="lg" fontWeight="bold" mb={3}>
          {selectedNodeId ? "Node details" : "SidePanel"}
        </Text>

        {/* Tabs in Header */}
        <Tabs
          index={selectedTab === "debug" ? 0 : selectedTab === "menu" ? 1 : 2}
          onChange={(index) =>
            setSelectedTab(
              index === 0 ? "debug" : index === 1 ? "menu" : "checkov"
            )
          }
        >
          <TabList>
            <Tab>Debug</Tab>
            <Tab>Menu</Tab>
            <Tab>Checkov</Tab>
          </TabList>
        </Tabs>

        <IconButton
          aria-label="Close details"
          icon={
            <Text fontSize="lg" fontWeight="bold">
              ×
            </Text>
          }
          size="sm"
          position="absolute"
          top={2}
          right={2}
          onClick={handleClose}
        />
      </Box>

      {/* Scrollable Content */}
      <Box flex={1} overflowY="auto">
        <Box p={4}>
          <Tabs
            index={selectedTab === "debug" ? 0 : selectedTab === "menu" ? 1 : 2}
            onChange={(index) =>
              setSelectedTab(
                index === 0 ? "debug" : index === 1 ? "menu" : "checkov"
              )
            }
          >
            <TabPanels>
              <TabPanel>
                <DebugTab />
              </TabPanel>
              <TabPanel>
                <MenuTab />
              </TabPanel>
              <TabPanel>
                <CheckovTab />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </Box>
  );
}
