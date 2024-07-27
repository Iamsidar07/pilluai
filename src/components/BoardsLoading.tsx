import React from "react";
import { Skeleton } from "./ui/skeleton";
import { EllipsisVertical } from "lucide-react";

const BoardSkeleton = () => {
  return (
    <div className="w-full h-20 border rounded-md p-4 flex justify-between">
      <div className="w-full">
        <Skeleton className="w-1/2 h-4 mb-2" />
        <Skeleton className="w-3/4 h-4 mb-2" />
      </div>
      <EllipsisVertical className="w-6 h-6 text-gray-400 " />
    </div>
  );
};

const BoardsLoading = () => {
  return (
    <div className="flex flex-col gap-2">
      {new Array(5).fill(0).map((_, i) => (
        <BoardSkeleton key={i} />
      ))}
    </div>
  );
};

export default BoardsLoading;
