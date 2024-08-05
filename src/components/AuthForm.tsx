"use client";
import { auth, provider } from "@/firebase";
import { signInWithPopup } from "firebase/auth";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface AuthFormProps {
  title: string;
  fields: Array<{ name: string; type: string; label: string }>;
  actionText: string;
  alternateText: string;
  alternateLink: string;
  handleSubmit: (e: FormData) => void;
  googleText: string;
  isLoading: boolean;
}

const AuthForm = ({
  title,
  fields,
  actionText,
  alternateText,
  alternateLink,
  handleSubmit,
  googleText,
  isLoading,
}: AuthFormProps) => {
  const [isPending, startTransition] = useTransition();
  const handleSignInWithGoogle = () => {
    startTransition(async () => {
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.log(error);
      }
    });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto p-4 lg:p-8 pt-12 lg:pt-24">
      <Image src="/logo.png" alt="logo" width={100} height={100} />
      <h1 className="text-3xl font-bold text-center mt-4">{title}</h1>
      <div className="w-full max-w-xl shadow-sm bg-white border px-6 py-12 rounded-md mt-4 flex flex-col gap-4">
        <form
          action={handleSubmit}
          className="w-full h-full flex flex-col gap-4"
        >
          {fields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name.toLowerCase()}
                className="block text-sm font-medium text-gray-700 capitalize"
              >
                {field.label}
              </label>
              <Input
                type={field.type}
                id={field.name}
                name={field.name}
                className="mt-2"
              />
            </div>
          ))}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="animate-spin opacity-80 mx-auto" />
            ) : (
              actionText
            )}
          </Button>
        </form>
        <div className="flex items-center gap-1 mt-4">
          <div className="h-px bg-gray-300 w-full" />
          <p className="text-gray-500 uppercase">or</p>
          <div className="h-px bg-gray-300 w-full" />
        </div>
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleSignInWithGoogle();
          }}
        >
          {isPending ? (
            <Loader2 className="animate-spin opacity-80" />
          ) : (
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                <path
                  d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                  fill="#EA4335"
                ></path>
                <path
                  d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                  fill="#34A853"
                ></path>
              </svg>
              {googleText}
            </div>
          )}
        </Button>
        <Link
          href={alternateLink}
          className="text-center font-bold text-primary"
        >
          {alternateText}
        </Link>
      </div>
    </div>
  );
};

export default AuthForm;
