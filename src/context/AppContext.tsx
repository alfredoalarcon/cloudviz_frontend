// src/context/AppContext.tsx
import React from "react";

type AppContextType = {
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  openDetails: (nodeId: string) => void;
};

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(
    null
  );

  const openDetails = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    // open a modal / drawer here (Chakra’s useDisclosure, etc.)
  };

  const value = { selectedNodeId, setSelectedNodeId, openDetails };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within <AppProvider>");
  return ctx;
};
