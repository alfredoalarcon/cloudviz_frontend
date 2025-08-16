import { ChakraProvider } from "@chakra-ui/react";
import Workflow from "./Workflow";
import "./index.css";
import { ReactFlowProvider } from "@xyflow/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { AppProvider } from "./context/AppContext";
import DetailsDrawer from "./components/DetailsDrawer";
import { extendTheme } from "@chakra-ui/react";

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
    <AppProvider>
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <ReactFlowProvider>
            <FormProvider {...form}>
              <DetailsDrawer />
              <Workflow />
            </FormProvider>
          </ReactFlowProvider>
        </QueryClientProvider>
      </ChakraProvider>
    </AppProvider>
  );
}

export default App;
