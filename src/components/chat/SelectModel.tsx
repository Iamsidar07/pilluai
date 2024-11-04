import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChatContext } from "@/context/chatContext";
import { Model } from "../../../typing";
import Image from "next/image";
import { buttonVariants } from "../ui/button";

const models = [
  {
    id: "google-generative-ai",
    name: "Google Generative AI",
  },
  {
    id: "mistral",
    name: "Mistral",
  },
] as Model[];

const SelectModel = () => {
  const { model, setModel } = useChatContext();
  return (
    <Select
      onValueChange={(id) =>
        setModel(() => models.find((m) => m.id === id) as Model)
      }
      value={model.id}
    >
      <SelectTrigger
        className={buttonVariants({
          variant: "secondary",
          size: "sm",
          className: "w-fit text-xs mb-1.5 flex items-center gap-1 rounded-md",
        })}
      >
        <div className="w-4 h-4 border rounded-full overflow-hidden">
          <Image
            src={`/${model.id}.svg`}
            alt={model.name}
            width={100}
            height={100}
            className="object-contain"
          />
        </div>
        <SelectValue placeholder={model.name} />
      </SelectTrigger>
      <SelectContent>
        {models?.map((llm) => (
          <SelectItem key={llm.id} value={llm.id}>
            {llm.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectModel;
