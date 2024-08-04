import { cn } from "@/lib/utils";
import { Handle, Position } from "@xyflow/react";
import { GoDotFill, GoPlus } from "react-icons/go";

interface CustomHandleProps {
  type: "source" | "target";
}

const CustomHandle = ({ type }: CustomHandleProps) => {
  return (
    <>
      <div
        className={cn(
          "react-flow__edge-path z-10 group hover:scale-110 transition-all hover:shadow-white hover:shadow-xl w-6 h-6 bg-pink-400 absolute rounded-full -right-2.5 top-1/2 -translate-y-1/2 border-2 border-white shadow-lg grid place-content-center",
          { "-left-3": type === "target" },
        )}
      >
        <div className="w-full h-full relative">
          <Handle
            type={type}
            position={type === "source" ? Position.Right : Position.Left}
            className="opacity-0 !absolute !rounded-0 !top-0 !translate-x-0 !translate-y-0 !w-full !h-full !transform-0"
          />
          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white">
            {type === "source" ? <GoPlus /> : <GoDotFill />}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomHandle;
