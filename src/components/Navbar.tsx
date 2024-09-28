"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button, buttonVariants } from "./ui/button";
import UpgradeButton from "./UpgradeButton";

const Navbar = () => {
  return (
    <div className="sticky top-0 z-30 bg-white/75 backdrop-blur border-b">
      <header className="flex items-center justify-between w-full py-2 px-4 lg:px-12">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold flex items-center gap-1">
            <Image
              src="/logo.png"
              alt="Pillu AI"
              width={30}
              height={30}
              className="object-contain"
            />
          </Link>
        </div>
        <div className="flex items-center">
          <Link
            className={buttonVariants({
              className: "!text-black hidden sm:block",
              variant: "link",
            })}
            href="/pricing"
          >
            Pricing
          </Link>
          <SignedIn>
            <div className="flex items-center gap-1 h-full">
              <Link
                className={buttonVariants({
                  className: "hidden sm:block !text-black",
                  variant: "link",
                })}
                href="/boards"
              >
                Boards
              </Link>
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
