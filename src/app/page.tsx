import { buttonVariants } from "@/components/ui/button";
import {
  Bot,
  FileText,
  MonitorSmartphone,
  ShieldCheck,
  ShieldPlus,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const FEATURES = [
  {
    icon: <ShieldCheck />,
    text: "Keep all your important PDF files securely stored and easily accessible anytime, anywhere.",
  },
  {
    icon: <Zap />,
    text: "Experience lightning-fast answer to your queries ensuring you get the information you need instantly.",
  },
  {
    icon: <Bot />,
    text: "Our intelligent chatbot remmebers previous interaction, providing a seamless and personalized experience.",
  },
  {
    icon: <FileText />,
    text: "Engage with your PDFs like never before using our intuitive and interactive viewer.",
  },
  {
    icon: <ShieldPlus />,
    text: "Rest assured knowing your documents are safely backed up on the cloud, protected from loss or damage",
  },
  {
    icon: <MonitorSmartphone />,
    text: "Access and chat with your PDFs seamlessly on any device, whether it's your desktop, tablet, or smartphone.",
  },
];

export default async function Home() {
  return (
    <main className="px-4 md:px-8 py-12 lg:py-24 flex flex-col items-center min-h-screen max-w-7xl mx-auto">
      <div className="rounded-full ring-1 ring-inset ring-gray-900/10 shadow-sm p-px">
        <div className="w-full h-full px-4 py-1.5 rounded-full text-sm bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text font-bold">
          Introducing chat with pdf
        </div>
      </div>
      <h1 className="text-lg md:text-3xl lg:text-5xl font-bold mt-2">
        Transform your pdf&apos;s into interactive conversation
      </h1>
      <p className="mt-2">
        Upload your document, and our chatbot will answer questions, summarize
        content, and answer all your Qs. Ideal for everyone,{" "}
      </p>
      <Link
        href={"/dashboard"}
        className={buttonVariants({ className: "mt-4" })}
      >
        Get started
      </Link>
      <div className="w-full max-w-full rounded-2xl shadow-lg shadow-white/80 border p-4 bg-gray-900/5 ring-px ring-inset ring-gray-900/10 overflow-hidden relative my-12 md:my-24">
        <Image
          src="/image.png"
          alt="Product"
          width={1920}
          height={1080}
          quality={100}
          className="w-full h-full rounded-lg"
        />
      </div>

      {/* features */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
        {FEATURES.map((feature, i) => (
          <div
            key={i}
            className="p-4 ring-1 ring-inset ring-gray-900/10 rounded-lg lg:rounded-2xl space-y-4 bg-zinc-100/5  backdrop-blur-sm"
          >
            <div className="w-6 h-6 md:w-12 md:h-12 grid text-gray-400 place-items-center ring-1 ring-inset ring-gray-900/10 rounded-xl">
              {feature.icon}
            </div>
            <p className="font-sm md:font-normal text-gray-500 opacity-80">
              {feature.text}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
