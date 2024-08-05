import { Loader2 } from "lucide-react";
import React from "react";

const loading = () => {
  return (
    <div className="absolute inset-0 bg-zinc-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl lg:text-9xl font-bold text-gray-200">
        Loading...
      </h1>
    </div>
  );
};

export default loading;
