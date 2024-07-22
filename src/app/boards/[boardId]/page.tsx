import Board from "@/components/Board";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Metadata, ResolvingMetadata } from "next";

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
  const boardRef = doc(db, "boards", boardId);
  const board = await getDoc(boardRef);

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: board?.data()?.name || "My Board",
    openGraph: {
      images: ["/og.png", ...previousImages],
    },
  };
}

export default function BoardPage({ params }: BoardProps) {
  const { boardId } = params;
  return <Board boardId={boardId} />;
}
