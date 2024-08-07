import React from "react";

const loading = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full  h-[calc(100vh-56px)] overflow-hidden bg-zinc-200 px-0 py-8">
      <h1 className="text-[15vw] text-center font-bold text-white animate-pulse">
        Loading...
      </h1>
    </div>
  );
};

export default loading;
