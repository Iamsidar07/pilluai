"use client";
import PanelContextProvider from "@/context/panel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactFlowProvider } from "@xyflow/react";
import React, { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";

const Provider = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient();
  return (
    <ClerkProvider>
      <QueryClientProvider client={client}>
        <ReactFlowProvider>
          <PanelContextProvider>{children}</PanelContextProvider>
        </ReactFlowProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default Provider;
