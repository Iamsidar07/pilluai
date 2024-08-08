import Board from "@/components/Board";
import { db } from "@/firebase";
import { auth } from "@clerk/nextjs/server";
import { doc, getDoc } from "firebase/firestore";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface BoardProps {
  params: {
    boardId: string;
  };
}

export async function generateMetadata(
  { params }: BoardProps,
  parent: ResolvingMetadata
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

const Loader = () => (
  <div className="absolute inset-0 bg-zinc-200 flex flex-col items-center justify-center">
    <h1 className="text-[20vw] font-bold text-white animate-pulse">
      Loading...
    </h1>
  </div>
);
export default function BoardPage({ params }: BoardProps) {
  auth().protect();
  const { boardId } = params;
  return (
    <ErrorBoundary
      fallback={
        <h1 className="text-2xl lg:text-5xl text-center">
          Something went wrong! Please refresh the page
        </h1>
      }
    >
      <Suspense fallback={<Loader />}>
        <Board boardId={boardId} />
      </Suspense>
    </ErrorBoundary>
  );
}
