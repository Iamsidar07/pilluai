"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button, buttonVariants } from "./ui/button";
import UpgradeButton from "./UpgradeButton";
import Feedback from "./Feedback";

const Navbar = () => {
  return (
    <div className="sticky top-0 z-30 bg-white/75 backdrop-blur border-b">
      <header className="flex items-center justify-between w-full py-2 px-4 lg:px-12">
        <div className="flex items-center gap-1">
          <Link href="/" className="text-2xl font-bold flex items-center gap-1">
            <Image
              src="/logo.png"
              alt="Pillu AI"
              width={30}
              height={30}
              className="object-contain"
            />
          </Link>
          <Link
            className={buttonVariants({
              className: "!text-black hidden sm:block lowercase",
              variant: "ghost",
            })}
            href="/pricing"
          >
            Pricing
          </Link>
          <span className="hidden sm:inline-flex">
            <Feedback />
          </span>
        </div>
        <div>
          <SignedIn>
            <div className="flex items-center gap-2 h-full lowercase">
              <Link
                className={buttonVariants({
                  className: "hidden sm:block !text-black",
                  variant: "ghost",
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
            <Button asChild variant={"ghost"} className="text-black">
              <Link href="/sign-in">Login</Link>
            </Button>
            <Button asChild variant={"ghost"} className="text-black">
              <Link href="/sign-up">Register</Link>
            </Button>
          </SignedOut>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
