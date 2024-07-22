"use client";

import { initializeAuthListener } from "@/store/userStore";
import { ReactFlowProvider } from "@xyflow/react";
import React, { useEffect } from "react";

function FlowWithProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeAuthListener();
  }, []);
  return <ReactFlowProvider>{children}</ReactFlowProvider>;
}

export default FlowWithProvider;
