import { ChakraProvider, Box } from "@chakra-ui/react";
import Workflow from "./Workflow";
import "./index.css";
import { ReactFlowProvider } from "@xyflow/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { AppProvider } from "./context/AppContext";
import FloatingPanelButton from "./components/FloatingPanelButton";
import { extendTheme } from "@chakra-ui/react";
import SidePanel from "./components/SidePanel";

// Define Chakra UI theme
const theme = extendTheme({
  styles: {
    global: {
      "html, body": {
        fontSize: "10px", // <- absolute base font size
      },
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 0,
    },
  },
});

function App() {
  const form = useForm();

  return (
    <ReactFlowProvider>
      <AppProvider>
        <ChakraProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <FormProvider {...form}>
              <Box position="relative" height="100vh" width="100vw">
                <SidePanel />
                <Workflow />
                <FloatingPanelButton />
              </Box>
            </FormProvider>
          </QueryClientProvider>
        </ChakraProvider>
      </AppProvider>
    </ReactFlowProvider>
  );
}

export default App;
