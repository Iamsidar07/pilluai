"use client";
import { CurrentUserContextProvider } from "@/context/currentUser";
import PanelContextProvider from "@/context/panel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactFlowProvider } from "@xyflow/react";
import React, { ReactNode } from "react";

const Provider = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <ReactFlowProvider>
        <CurrentUserContextProvider>
          <PanelContextProvider>{children}</PanelContextProvider>
        </CurrentUserContextProvider>
      </ReactFlowProvider>
    </QueryClientProvider>
  );
};

export default Provider;
