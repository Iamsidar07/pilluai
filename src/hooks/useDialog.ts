"use client";
import React from "react";

const useDialog = () => {
  const [open, setOpen] = React.useState(false);
  return {
    open,
    setOpen,
  };
};

export default useDialog;
