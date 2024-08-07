import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Board } from "../../typing";
import DeleteBoard from "./DeleteBoard";
import RenameBoard from "./RenameBoard";
import { formatDistanceToNow } from "date-fns";

interface BoardItemProps {
  board: Board;
}
const BoardItem = ({ board }: BoardItemProps) => {
  return (
    <div
      key={board.id}
      className="p-4 border w-full flex items-center justify-between rounded-lg cursor-pointer"
    >
      <Link href={`/boards/${board.id}`}>
        <p className="font-bold">{board.name}</p>
        <p className="text-gray-400 mt-2 text-xs">
          {formatDistanceToNow(new Date(board.createdAt.toDate()), {
            addSuffix: true,
            includeSeconds: true,
          })}
        </p>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EllipsisVertical className="w-6 h-6 text-gray-400 cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="text-gray-400 flex flex-col gap-1">
          <DropdownMenuItem asChild className="w-full">
            <DeleteBoard boardId={board.id} />
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="w-full">
            <RenameBoard name={board.name} boardId={board.id} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default BoardItem;
