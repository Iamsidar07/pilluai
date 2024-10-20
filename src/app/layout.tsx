import "../styles/globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import Provider from "@/components/Provider";

export const metadata: Metadata = {
  title: "PilluAI",
  description: "PilluAI: Your ultimate whiteboard on steroid.",
  openGraph: {
    title: "PilluAI",
    description: "PilluAI: Your ultimate whiteboard on steroid.",
    type: "website",
    url: "https://pilluai.onrender.com",
    images: [
      {
        url: "https://pilluai.onrender.com/og.png",
        width: 1920,
        height: 1080,
      },
    ],
  },
  twitter: {
    title: "PilluAI",
    description: "PilluAI: Your ultimate whiteboard on steroid.",
    card: "summary_large_image",
    images: [
      {
        url: "https://pilluai.onrender.com/og.png",
        width: 1920,
        height: 1080,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider>
      <html lang="en" className="light ">
        <body className={`flex flex-col antialiased`}>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Toaster position="top-center" />
        </body>
      </html>
    </Provider>
  );
}
