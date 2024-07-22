import { Loader2 } from "lucide-react";
import React from "react";

const loading = () => {
  return (
    <div className="w-full h-[calc(100vh-56px)] overflow-hidden pt-12 lg:pt-24">
      <Loader2 className="animate-spin mx-auto" />
    </div>
  );
};

export default loading;
