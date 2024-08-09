"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import UpgradeButton from "./UpgradeButton";

const Navbar = () => {
  return (
    <div className="sticky top-0 z-30 bg-white/75 backdrop-blur border-b">
      <header className="flex items-center justify-between w-full h-14 px-4 lg:px-12">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold flex items-center gap-1">
            <Image
              src="/logo.png"
              alt="Pillu AI"
              width={30}
              height={30}
              className="object-contain"
            />
            Pillu <span className="text-primary">AI</span>
          </Link>
        </div>
        <div className="flex">
          <Button
            asChild
            variant={"link"}
            className="text-black hidden sm:block"
          >
            <Link href="/pricing">Pricing</Link>
          </Button>
          <SignedIn>
            <div className="flex items-center gap-2 h-full">
              <Button asChild variant={"link"} className="text-black">
                <Link href="/boards">Boards</Link>
              </Button>
              <UpgradeButton />
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <Button asChild variant={"link"} className="text-black">
              <Link href="/sign-in">Login</Link>
            </Button>
            <Button asChild variant={"link"} className="text-black">
              <Link href="/sign-up">Register</Link>
            </Button>
          </SignedOut>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
