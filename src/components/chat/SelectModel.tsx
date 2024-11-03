import React from "react";
import { Model } from "./Chat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface Props {
  model: Model;
  setModel: React.Dispatch<React.SetStateAction<Model>>;
}

const SelectModel = ({ model, setModel }: Props) => {
  return (
    <Select onValueChange={(id)=>setModel(()=>models.find((m)=>m.id===id) as Model)}>
      <SelectTrigger className="w-[180px]">
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
