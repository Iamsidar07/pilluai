import React from "react";

const loading = () => {
  return (
    <div className="absolute inset-0 bg-zinc-200 flex flex-col items-center justify-center">
      <h1 className="text-[20vw] font-bold text-white animate-pulse">Loading...</h1>
    </div>
  );
};

export default loading;
