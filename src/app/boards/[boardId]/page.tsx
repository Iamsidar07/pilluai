import Board from "@/components/Board";
import { db } from "@/firebase";
import { auth } from "@clerk/nextjs/server";
import { doc, getDoc } from "firebase/firestore";
import { Metadata, ResolvingMetadata } from "next";

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

export default function BoardPage({ params }: BoardProps) {
  auth().protect();
  const { boardId } = params;
  return <Board boardId={boardId} />;
}
