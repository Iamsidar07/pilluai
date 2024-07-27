"use client";
import React, { useTransition } from "react";
import AuthForm from "@/components/AuthForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import useCurrentUser from "@/context/currentUser";
import { User } from "../../../typing";
import signupSchema from "@/schemas/signupSchema";
import createAccount from "@/actions/createAccount";

const fields = [
  {
    name: "name",
    label: "name",
    type: "text",
  },
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
const Signup = () => {
  const { setUser, user } = useCurrentUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignup = (formData: FormData) => {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const { success, error } = signupSchema.safeParse({
      email,
      password,
      name,
    });
    if (!success && error) {
      toast.error(error.message ?? "Please check your inputs");
      return;
    }

    if (!name || !email || !password) {
      toast.error("All fields are required");
      return;
    }
    startTransition(async () => {
      const { success, user } = await createAccount({ email, password, name });
      if (success) {
        setUser(user as User);
        toast.success("Successfully created account");
        router.push("/");
      } else {
        toast.error("Failed to create account");
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
      title="Join Pilluai"
      fields={fields}
      actionText="Sign Up"
      alternateText="Sign in to your account"
      alternateLink="/login"
      handleSubmit={handleSignup}
      googleText="Continue with Google"
      isLoading={isPending}
    />
  );
};

export default Signup;
