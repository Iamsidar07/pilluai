"use client";

import { storage } from "@/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useCallback, useState } from "react";
import { nanoid } from "nanoid";

import { usePanel } from "@/context/panel";
import { toast } from "sonner";
import useSubscription from "./useSubscription";
import { freePdfSize, proPdfSize } from "@/lib/config";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

export enum StatusText {
  UPLOADING = "Uploading file...",
  UPLOADED = "File uploaded successfully",
  SAVING = "Saving file...",
  GENERATING = "Generating AI Embeddings...",
}

export type Status = (typeof StatusText)[keyof typeof StatusText];

function useUpload() {
  const { hasActiveMembership } = useSubscription();
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const { user } = useUser();
  const { updateNode } = usePanel();

  const handleUpload = useCallback(
    async (file: File, nodeId: string) => {
      if (!file || !user) return;

      // Quick validation checks
      if (!hasActiveMembership && file.size >= freePdfSize * 10 ** 6) {
        toast.error(`Reached the ${freePdfSize}MB limit size.`);
        return;
      }
      if (hasActiveMembership && file.size >= proPdfSize * 10 ** 6) {
        toast.error(`Reached the ${proPdfSize}MB limit size.`);
        return;
      }

      // Start upload immediately
      const fileIdToUpload = nanoid();
      const storageRef = ref(storage, `/users/${user.id}/files/${fileIdToUpload}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Start embedding generation in parallel with upload
      let embeddingPromise: Promise<any> | null = null;

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
          setStatus(StatusText.UPLOADING);
          
          // Start embedding generation when upload is almost complete
          if (progress > 90 && !embeddingPromise) {
            embeddingPromise = getDownloadURL(uploadTask.snapshot.ref).then(url =>
              axios.post("/api/generateEmbeddings", {
                type: "pdf",
                url
              })
            );
          }
        },
        (e) => {
          toast.error("Error uploading file");
          console.log(e);
        },
        async () => {
          setStatus(StatusText.UPLOADED);
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Update node with file info immediately
          updateNode({
            id: nodeId,
            type: "pdfNode", 
            data: {
              url: downloadUrl,
              name: file.name,
              metadata: `This is pdf file. Type: pdf, URL: ${downloadUrl}, Name: ${file.name}`,
            },
          });

          try {
            setStatus(StatusText.GENERATING);
            // Use the already started embedding generation
            const embeddingResponse = await (embeddingPromise || axios.post(
              "/api/generateEmbeddings",
              {
                type: "pdf",
                url: downloadUrl,
              }
            ));

            updateNode({
              id: nodeId,
              type: "pdfNode",
              data: {
                namespace: embeddingResponse.data.namespace,
              },
            });
          } catch (error) {
            console.log(error);
            toast.error("Failed to generate embedding");
          }
        }
      );
    },
    [hasActiveMembership, updateNode, user]
  );

  return { progress, status, handleUpload };
}

export default useUpload;
