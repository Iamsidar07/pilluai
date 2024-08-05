"use client";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import useCurrentUser from "@/context/currentUser";

const GetStartedButton = () => {
  const { user } = useCurrentUser();
  return (
    <Button className="mt-4 rounded-2xl px-6 font-bold" asChild>
      <Link href={user ? "/boards" : "/signup"}>Get started</Link>
    </Button>
  );
};

export default GetStartedButton;
