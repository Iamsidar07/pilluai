import "../styles/globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import Provider from "@/components/Provider";
import { GeistSans } from "geist/font/sans";

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
        <body className={`${GeistSans.className} flex flex-col`}>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Toaster position="top-center" />
        </body>
      </html>
    </Provider>
  );
}
