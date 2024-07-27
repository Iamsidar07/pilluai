import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/novel.css";
import "../styles/globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import Provider from "@/components/Provider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--heading-font",
});

export const metadata: Metadata = {
  title: "PilluAI",
  description: "PilluAI: GPT on Steroids + Boards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={inter.className}>
        <Provider>
          <Navbar />
          {children}
        </Provider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
