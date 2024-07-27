"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";
import useCurrentUser from "@/context/currentUser";

const Navbar = () => {
  const pathname = usePathname();
  const { user, setUser } = useCurrentUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push("/login");
    } catch (e: any) {
      toast.error("Failed to signout.");
      console.log(e);
    }
  };
  return (
    <header
      className={cn(
        "sticky top-0 flex items-center justify-between bg-white shadow-sm border-b h-14 px-4 lg:px-8",
        {
          hidden: pathname === "/signup" || pathname === "/login",
        }
      )}
    >
      <div className="flex items-center gap-6">
        <Link href="/">
          <Image
            src="https://poppyai.vercel.app/_next/image?url=%2Flogo-300-no-text.png&w=48&q=75"
            alt="logo"
            width={40}
            height={40}
          />
        </Link>
        <Link
          href="/boards"
          className={cn("", {
            "text-violet-500": pathname === "/boards",
          })}
        >
          Boards
        </Link>
      </div>
      {!user?.uid && (
        <div className="flex items-center gap-2">
          <Link href="/login">
            <p className="text-gray-500">Login</p>
          </Link>
          <Link href="/signup">
            <p className="text-gray-500">Sign up</p>
          </Link>
        </div>
      )}
      {user?.uid && (
        <div className="flex items-center gap-2">
          <span>Welcome, {user.name || ""}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="cursor-pointer">
              <Avatar>
                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                <AvatarImage src={user.photoURL} />
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
};

export default Navbar;
