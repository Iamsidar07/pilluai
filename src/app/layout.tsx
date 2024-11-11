import "../styles/globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import Provider from "@/components/Provider";
import localFont from "next/font/local";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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
        <body className={`${geistSans.variable} ${geistMono.variable} flex flex-col antialiased font-[family-name:var(--font-geist-sans)]`}>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Toaster position="top-center" />
        </body>
      </html>
    </Provider>
  );
}
