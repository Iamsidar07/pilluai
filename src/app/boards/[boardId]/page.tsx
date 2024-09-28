import { db } from "@/firebase";
import { auth } from "@clerk/nextjs/server";
import { doc, getDoc } from "firebase/firestore";
import { Metadata, ResolvingMetadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const Loader = () => (
  <div className="absolute inset-0 bg-zinc-200 flex flex-col items-center justify-center">
    <h1 className="text-[20vw] font-bold text-white animate-pulse">
      Loading...
    </h1>
  </div>
);

const Board = dynamic(() => import("@/components/Board"), {
  ssr: false,
  loading: () => <Loader />,
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
      images: ["/og.png", ...previousImages],
    },
  };
}

export default function BoardPage({ params }: BoardProps) {
  auth().protect();
  const { boardId } = params;
  return (
    <Suspense fallback={<Loader />}>
      <Board boardId={boardId} />
    </Suspense>
  );
}
