"use client";
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
import UpgradeButton from "./UpgradeButton";
import Image from "next/image";

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
    <div
      className={cn("sticky top-0 z-30 bg-white/75 backdrop-blur border-b", {
        hidden: pathname === "/signup" || pathname === "/login",
      })}
    >
      <header className="flex items-center justify-between w-full max-w-7xl mx-auto h-14 px-4 lg:px-0">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold flex items-center gap-1">
            <Image
              src="/logo.png"
              alt="Pillu AI"
              width={50}
              height={50}
              className="object-contain"
            />
            Pillu <span className="text-primary">AI</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {user?.uid && (
            <Link
              href="/boards"
              className={cn("", {
                "text-primary": pathname === "/boards",
              })}
            >
              Boards
            </Link>
          )}
          <Link
            href="/pricing"
            className={cn("hidden md:block", {
              "text-primary": pathname === "/pricing",
            })}
          >
            Pricing
          </Link>

          {!user?.uid && (
            <>
              <Link href="/login">Login</Link>
              <Link href="/signup">Sign up</Link>
            </>
          )}

          {user?.uid && (
            <>
              <UpgradeButton />
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
            </>
          )}
        </div>
      </header>
    </div>
  );
};

export default Navbar;
