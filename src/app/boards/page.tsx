import CreateBoard from "@/components/CreateBoard";
import Boards from "@/components/Boards";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Boards",
};

export default function Dashboard() {
  return (
    <div className="flex flex-col max-w-xl mx-auto pt-12 lg:pt-12 items-center">
      <CreateBoard />
      <Boards />
    </div>
  );
}
