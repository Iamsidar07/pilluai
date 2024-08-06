import React from "react";

const loading = () => {
  return (
    <div className="absolute inset-0 bg-zinc-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl sm:text-7xl lg:text-[15rem] font-bold text-gray-300">
        Loading...
      </h1>
    </div>
  );
};

export default loading;
