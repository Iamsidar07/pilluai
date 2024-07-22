import { NodeResizer } from "@xyflow/react";

const CustomResizer = ({ color = "transparent" }: { color?: string }) => {
  return (
    <NodeResizer
      color={color}
      handleStyle={{
        backgroundColor: "transparent", // Makes the handle background transparent
        border: "none", // Removes the handle border
      }}
      lineStyle={{
        backgroundColor: "transparent", // Makes the lines transparent
      }}
    />
  );
};

export default CustomResizer;
