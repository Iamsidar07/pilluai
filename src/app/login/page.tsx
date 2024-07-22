"use client";
import React, { useEffect } from "react";
import AuthForm from "@/components/AuthForm";
import { loginAccount } from "@/actions";
import { useRouter } from "next/navigation";
import { User, useUserStore } from "@/store/userStore";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

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
  const { setUser, user } = useUserStore();
  const { toast } = useToast();

  const action = useMutation({
    mutationFn: (formData: FormData) => loginAccount(formData),
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
      title="Sign in to your account"
      fields={fields}
      actionText="Sign in"
      alternateText="Sign in to your account"
      alternateLink="/signup"
      handleSubmit={action.mutate}
      googleText="Continue with Google"
      isLoading={action.isPending}
    />
  );
};

export default Login;
