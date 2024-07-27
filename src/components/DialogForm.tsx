"use client";
import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, X } from "lucide-react";

interface DialogFormProps {
  title: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  actionText: string;
  actionHandler: () => void;
  isLoading: boolean;
}

const DialogForm = ({
  title,
  open,
  value,
  onChange,
  actionText,
  actionHandler,
  isLoading,
  setOpen,
}: DialogFormProps) => {
  const handleActionClick = () => {
    actionHandler();
    setOpen(false);
  };
  return (
    <Dialog open={open}>
      <DialogContent className="w-full max-w-lg border">
        <DialogClose
          asChild
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="font-bold text-lg lg:text-2xl">
            {title}
          </DialogTitle>
        </DialogHeader>
        <Input value={value} onChange={onChange} />
        <Button onClick={handleActionClick} className="w-full">
          {isLoading ? <Loader2 className="animate-spin" /> : actionText}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DialogForm;
