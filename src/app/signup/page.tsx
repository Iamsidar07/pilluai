"use client";
import React from "react";
import AuthForm from "@/components/AuthForm";
import { createAccount } from "@/actions";
import { useRouter } from "next/navigation";
import { useUserStore, User } from "@/store/userStore";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

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
  // TODO: Check if it is necessary to set user here.
  const { setUser, user } = useUserStore();
  const router = useRouter();
  const { toast } = useToast();

  const action = useMutation({
    mutationFn: (formData: FormData) => createAccount(formData),
    onSuccess: ({ user }) => {
      setUser(user as User);
      toast({
        title: "Successfully logged in",
        description: "You will be redirected soon",
      });
      router.push("/");
    },
    onError: (error) => {
      console.log("Failed to login", error);
      toast({
        title: "Failed to login",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
      handleSubmit={action.mutate}
      googleText="Continue with Google"
      isLoading={action.isPending}
    />
  );
};

export default Signup;
