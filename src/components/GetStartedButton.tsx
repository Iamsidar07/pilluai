"use client";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const GetStartedButton = () => {
  const { user } = useUser();
  return (
    <Button className="mt-4 rounded-2xl px-6 font-bold" asChild>
      <Link href={user ? "/boards" : "/sign-up"}>Get started</Link>
    </Button>
  );
};

export default GetStartedButton;
