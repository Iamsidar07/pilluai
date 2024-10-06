import Loader from "@/components/Loader";
import React from "react";

const loading = () => {
  return (
    <div className="absolute inset-0 bg-white flex flex-col items-center justify-center">
      <Loader />
      <p className="mt-4 opacity-90 text-black">
        Launching unforgetable experience...
      </p>
    </div>
  );
};

export default loading;
