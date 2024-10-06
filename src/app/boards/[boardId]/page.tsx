import { db } from "@/firebase";
import { auth } from "@clerk/nextjs/server";
import { doc, getDoc } from "firebase/firestore";
import { Metadata, ResolvingMetadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Loader from "@/components/Loader";

const LoaderAnimation = () => (
  <div className="absolute inset-0 bg-white flex flex-col items-center justify-center">
    <Loader />
    <p className="mt-4 text-gray-500 opacity-90">
      Preparing your whiteboard...
    </p>
  </div>
);

const Board = dynamic(() => import("@/components/Board"), {
  ssr: false,
  loading: () => <LoaderAnimation />,
});

interface BoardProps {
  params: {
    boardId: string;
  };
}

export async function generateMetadata(
  { params }: BoardProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { boardId } = params;
  const { userId } = auth();
  const boardRef = doc(db, `users/${userId}/boards`, boardId);
  const previousImages = (await parent).openGraph?.images || [];
  const board = await getDoc(boardRef);
  return {
    title: board?.data()?.name || "My Board",
    openGraph: {
      images: ["https://pilluai.vercel.app/og.png", ...previousImages],
    },
  };
}

export default function BoardPage() {
  return (
    <Suspense fallback={<LoaderAnimation />}>
      <Board />
    </Suspense>
  );
}
