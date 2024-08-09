import "../styles/globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import Provider from "@/components/Provider";
import { GeistSans } from "geist/font/sans";

export const metadata: Metadata = {
  title: "PilluAI",
  description: "PilluAI: Your ultimate whiteboard on steroid.",
  openGraph: {
    images: ["/og.png"], // Open Graph image
    type: "website",
    url: "https://www.pilluai.vercel.app",
    siteName: "PilluAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "PilluAI",
    description: "PilluAI: Your ultimate whiteboard on steroid.",
    images: [
      {
        url: "/og.png", // Twitter-specific OG image
        alt: "PilluAI - Your ultimate whiteboard on steroid.",
      },
    ],
    site: "@pilluai",
  },
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
