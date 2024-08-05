"use client";

import { db, storage } from "@/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useCallback, useState } from "react";
import { nanoid } from "nanoid";

import useCurrentUser from "@/context/currentUser";
import { usePanel } from "@/context/panel";
import generateEmbeddings from "@/actions/generateEmbeddings";
import { toast } from "sonner";
import useSubscription from "./useSubscription";
import { freePdfSize, proPdfSize } from "@/lib/config";

export enum StatusText {
  UPLOADING = "Uploading file...",
  UPLOADED = "File uploaded successfully",
  SAVING = "Saving file...",
  GENERATING = "Generating AI Embeddings...",
}

export type Status = (typeof StatusText)[keyof typeof StatusText];

function useUpload(nodeId: string) {
  const { hasActiveMembership } = useSubscription();
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const { user } = useCurrentUser();
  const { updateNode } = usePanel();

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file || !user) return;
      const fileIdToUpload = nanoid();
      const storageRef = ref(
        storage,
        `/users/${user.uid}/files/${fileIdToUpload}`
      );
      // limit file size
      if (!hasActiveMembership && file.size >= freePdfSize * 10 ** 6) {
        return toast.error(`Reached the ${freePdfSize}MB limit size.`);
      }
      // limit file size
      if (hasActiveMembership && file.size >= proPdfSize * 10 ** 6) {
        return toast.error(`Reached the ${proPdfSize}MB limit size.`);
      }
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
          setStatus(StatusText.UPLOADING);
        },
        (e) => {
          console.log("Error uploading file", e);
        },
        async () => {
          // Upload completed successfully
          setStatus(StatusText.UPLOADED);
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          updateNode({
            id: nodeId,
            type: "pdfNode",
            data: {
              url: downloadUrl,
              name: file.name,
            },
          });

          setStatus(StatusText.GENERATING);
          // Generate embeddings
          const { success, namespace } = await generateEmbeddings(downloadUrl);
          if (!success) {
            toast.error("Failed to generate embeddings");
            return;
          }
          updateNode({
            id: nodeId,
            type: "pdfNode",
            data: {
              namespace,
            },
          });
        }
      );
    },
    [hasActiveMembership, nodeId, updateNode, user]
  );
  return { progress, status, handleUpload };
}

export default useUpload;
