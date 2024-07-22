"use client";

import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user } = useUserStore();
  const router = useRouter();
  useEffect(() => {
    if (user && user.uid) {
      router.replace("/boards");
    } else {
      router.replace("/login");
    }
  }, [user, router]);
  return <div>Landing Page</div>;
}
