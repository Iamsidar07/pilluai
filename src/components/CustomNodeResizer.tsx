import { NodeResizer } from "@xyflow/react";
const CustomNodeResizer = () => {
  return (
    <NodeResizer
      isVisible
      color="#ec4899"
      handleStyle={{
        borderRadius: "50%",
        width: "10px",
        height: "10px",
        background: "white",
        outline: "none",
        border: "1px solid #ec4899",
      }}
    />
  );
};

export default CustomNodeResizer;
