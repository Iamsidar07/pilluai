import "../styles/globals.css";
import type { Metadata } from "next";
import { Questrial, Audiowide } from "next/font/google";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import Provider from "@/components/Provider";
import { cn } from "@/lib/utils";

const inter = Questrial({
  subsets: ["latin"],
  weight: ["400"],
});
const audiowide = Audiowide({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--heading-font",
});

export const metadata: Metadata = {
  title: "PilluAI",
  description: "PilluAI: Your ultimate whiteboard on steroid.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider>
      <html lang="en" className="light">
        <body className={cn(audiowide.className, inter.className)}>
          <Navbar />
          {children}
          <Toaster position="top-center" />
        </body>
      </html>
    </Provider>
  );
}
