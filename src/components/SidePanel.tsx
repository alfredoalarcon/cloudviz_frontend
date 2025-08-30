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

export default function SidePanel() {
  const {
    selInfoEntity,
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
      overflowY="auto"
    >
      <VStack align="stretch" spacing={0} height="100%">
        <Box
          p={4}
          borderBottom="1px solid"
          borderColor="gray.200"
          bg="gray.50"
          position="relative"
        >
          <Text fontSize="lg" fontWeight="bold">
            {selInfoEntity ? `${selInfoEntity.type} details` : "SidePanel"}
          </Text>
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
        <Box p={4} flex={1}>
          <Tabs
            index={selectedTab === "debug" ? 0 : 1}
            onChange={(index) => setSelectedTab(index === 0 ? "debug" : "menu")}
          >
            <TabList>
              <Tab>Debug</Tab>
              <Tab>Menu</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <DebugTab />
              </TabPanel>
              <TabPanel>
                <MenuTab />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>
    </Box>
  );
}
