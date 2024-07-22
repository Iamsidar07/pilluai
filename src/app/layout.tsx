import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import FlowWithProvider from "@/components/FlowWithProvider";
import PanelContextProvider from "@/context/panel";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import { Toaster } from "@/components/ui/toaster";

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
        <ReactQueryProvider>
          <Navbar />
          <FlowWithProvider>
            <PanelContextProvider>{children}</PanelContextProvider>
          </FlowWithProvider>
        </ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
