"use client";
import React, { useEffect, useTransition } from "react";
import AuthForm from "@/components/AuthForm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useCurrentUser from "@/context/currentUser";
import { User } from "../../../typing";
import loginAccount from "@/actions/loginAccount";
import loginSchema from "@/schemas/loginSchema";

const fields = [
  {
    name: "email",
    label: "Email",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
  },
];

const Login = () => {
  const router = useRouter();
  const { setUser, user } = useCurrentUser();
  const [isPending, startTransition] = useTransition();

  const handleLogin = (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const { success, error } = loginSchema.safeParse({ email, password });
    if (!success && error) {
      toast.error(error.message ?? "Invalid email or password");
      return;
    }
    startTransition(async () => {
      const { success, user } = await loginAccount({ email, password });
      if (success) {
        setUser(user as User);
        toast.success("Successfully logged in");
        router.push("/");
      } else {
        toast.error("Failed to login");
      }
    });
  };

  useEffect(() => {
    if (user && user.uid) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <AuthForm
      title="Sign in to your account"
      fields={fields}
      actionText="Sign in"
      alternateText="Sign in to your account"
      alternateLink="/signup"
      handleSubmit={handleLogin}
      googleText="Continue with Google"
      isLoading={isPending}
    />
  );
};

export default Login;
