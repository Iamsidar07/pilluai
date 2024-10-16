"use client";
import { usePanel } from "@/context/panel";
import { getNewNodePosition } from "@/lib/utils";
import { useKeyPress, useReactFlow } from "@xyflow/react";
import axios from "axios";
import { nanoid } from "nanoid";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { TPdfNode } from "./nodes";
import PanelItem from "./panels/PanelItem";
import FileUploader from "./PdfFileUploader";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import useUpload from "@/hooks/useUpload";
import { FileText } from "lucide-react";

const AddPdfNode = () => {
  const { status } = useUpload();
  const { addNode, nodes, updateNode } = usePanel();
  const isPressed = useKeyPress("p" || "P");
  const { fitView } = useReactFlow();
  const [isPending, startTransition] = useTransition();
  const [pdfUrl, setPdfUrl] = useState("");
  const [name, setName] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [open, setOpen] = useState(false);

  const handleAddPdfNode = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!pdfUrl || !pdfUrl.endsWith("pdf")) {
        toast.info("Invalid pdf url");
        return;
      }
      const newNode: TPdfNode = {
        position: getNewNodePosition(nodes),
        id: nanoid(),
        initialWidth: 225,
        initialHeight: 175,
        data: {
          type: "pdfNode",
          url: pdfUrl,
          name: name || nanoid(),
          namespace: "",
          metadata: `This is pdf. Type: pdf, URL: ${pdfUrl}`,
        },
        type: "pdfNode",
      };
      setNodeId(newNode.id);
      addNode(newNode);
      fitView();
      startTransition(async () => {
        try {
          const embeddingResponse = await axios.post(
            "/api/generateEmbeddings",
            {
              type: "pdf",
              url: pdfUrl,
            },
          );
          updateNode({
            id: nodeId,
            type: "pdfNode",
            data: {
              namespace: embeddingResponse.data.namespace,
            },
          });
          setPdfUrl("");
          setName("");
        } catch (error) {
          console.log(error);
          toast.error("Failed to generate embedding");
        }
      });
    },
    [addNode, fitView, updateNode, nodeId],
  );

  useEffect(() => {
    if (isPressed) {
      setOpen(true);
    }
  }, [handleAddPdfNode, isPressed]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <PanelItem text="Pdf" shortcutKey="P">
        <DialogTrigger asChild>
          <FileText />
        </DialogTrigger>
      </PanelItem>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a pdf document</DialogTitle>
          <DialogDescription>
            Insert a pdf url or drag and drop a pdf file
          </DialogDescription>
        </DialogHeader>
        <FileUploader setOpen={setOpen} />
        <div className="flex items-center justify-center gap-2 my-2 ">
          <Separator className="w-1/3" />
          <span className="text-sm text-gray-500">OR</span>
          <Separator className="w-1/3" />
        </div>
        <form onSubmit={handleAddPdfNode} className="flex flex-col gap-2">
          <Input
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            className="w-full"
            placeholder="pdf url"
          />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
            placeholder="Name of the pdf"
          />

          <Button
            disabled={isPending || !pdfUrl || !pdfUrl.endsWith("pdf")}
            type="submit"
            className="mt-6 w-full"
          >
            Generate Embeddings
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPdfNode;
