"use client";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {ChevronRightIcon} from "lucide-react"

const GetStartedButton = () => {
  const { user } = useUser();
  return (
    <Button className="mt-4 px-6 font-bold group hover:opacity-90" asChild>
      <Link href={user ? "/boards" : "/sign-up"} className={"flex items-center gap-1"}>
        Get started
        <ChevronRightIcon className={"w-4 h-4 group-hover:translate-x-1 transition-transform"}/>
      </Link>
    </Button>
  );
};

export default GetStartedButton;
