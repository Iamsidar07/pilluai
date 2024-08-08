"use client";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "./ui/button";
import { toast } from "sonner";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

const PdfViewer = ({ url, name }: { url: string; name: string }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setIsLoaded(true);
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
      {isLoaded && (
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
      )}
      <div className="flex-1 overflow-auto">
        <Document
          loading={
            <div className="w-44 h-44 flex flex-col items-center justify-center mx-auto">
              <Loader2 className="w-6 h-6 mx-auto animate-spin" />
            </div>
          }
          file={url}
          onLoadError={(e) => toast.error("Failed to load pdf")}
          onLoadSuccess={onDocumentLoadSuccess}
          className="nowheel nodrag textselectable"
        >
          <Page
            className="max-w-full"
            pageNumber={pageNumber}
          />
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;
