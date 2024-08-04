"use client";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ChevronDown, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "./ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfViewer = ({ url, name }: { url: string; name: string }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const handleGoToPreviousPage = () => {
    setPageNumber((previousPageNumber) => {
      if (previousPageNumber === 1) return 1;
      return previousPageNumber - 1;
    });
  };

  const handleGoToNexPage = () => {
    setPageNumber((previousPageNumber) => {
      if (previousPageNumber === numPages) return numPages;
      return previousPageNumber + 1;
    });
  };

  return (
    <div className="w-full h-full flex flex-col items-center bg-white/10 gap-1">
      <div className="flex items-center justify-between gap-2 px-4 py-1.5 w-full max-w-2xl mx-auto bg-white/75 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <div className="truncate">{name}</div>
          <div className="flex items-center gap-2 !text-xs">
            <Button
              disabled={pageNumber === 1}
              onClick={handleGoToPreviousPage}
              variant="outline"
              size={"sm"}
            >
              Previous
            </Button>
            {numPages === 0 ? (
              <p>No pages</p>
            ) : (
              <p>
                {pageNumber} of {numPages}
              </p>
            )}

            <Button
              disabled={pageNumber === numPages || numPages === 0}
              onClick={handleGoToNexPage}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <Document
          loading={<Loader2 className="w-6 h-6 m-4 mx-auto animate-spin" />}
          file={url}
          onLoadError={(e) => console.log("failed to load pdf", e)}
          onLoadSuccess={onDocumentLoadSuccess}
          className="nowheel nodrag overflow-y-auto textselectable"
        >
          <Page className="shadow-lg" pageNumber={pageNumber} scale={1.3} />
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;
