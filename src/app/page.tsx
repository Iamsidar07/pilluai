import Footer from "@/components/Footer";
import GetStartedButton from "@/components/GetStartedButton";
import Pricing from "@/components/Pricing";
import Image from "next/image";
import BentoGrid from "../components/BentoGrid";

export default async function Home() {
  return (
    <main className="w-full overflow-y-auto flex-1  bg-white">
      <div className="p-4 lg:p-8 bg-dot-black/[0.2]">
        <div className="max-w-7xl mx-auto flex flex-col items-center py-24 lg:py-32 relative">
          <div className="md:flex items-center justify-center absolute left-0 top-[5%] animate-bounce rounded-2xl px-2 border bg-white rotate-12 hidden">
            <Image
              src="/youtube.svg"
              alt="chat with youtube video"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>

          <div className="absolute right-0 top-[8%] w-32 aspect-square animate-bounce rounded-2xl px-2 border bg-white/90 hidden md:flex items-center justify-center">
            <Image
              src="/pdf-icon.png"
              alt="Chat with your pdf document"
              width={1503}
              height={1503}
              className="object-contain"
            />
          </div>

          <div className="absolute left-[15%] bottom-[10%] w-32 aspect-square animate-bounce rounded-2xl px-2 border bg-white/90 hidden md:flex items-center justify-center">
            <Image
              src="/website-icon.png"
              alt="chat with website"
              width={1503}
              height={1503}
              className="object-contain"
            />
          </div>

          <div className="hidden md:flex absolute right-[15%] w-32 aspect-square bottom-1/3 animate-bounce rounded-2xl px-2 border bg-white/90 items-center justify-center">
            <Image
              src="/image-icon.png"
              alt="chat with image"
              width={1503}
              height={1503}
              className="object-contain"
            />
          </div>
          <div className="absolute w-[220px] aspect-square -bottom-[30%] rounded-2xl opacity-[0.3] bg-pink-500 filter blur-[60px]" />
          <div className="mx-auto max-w-4xl text-left sm:text-center">
            <h2 className="font-semibold opacity-50">
              your interactive whiteboard comapanion
            </h2>
            <h1 className="text-3xl sm:text-5xl md:text-7xl mt-2 font-bold text-primary">
              Supercharge your <br />
              productivity
            </h1>
            <p className="mt-10 text-lg leading-6 text-gray-500 max-w-xl mx-auto">
              If you&apos;re a developer, video editor, researcher, or anyone
              who works with their brain, PilluAI can help you{" "}
              <span className="text-primary">think 10x faster, </span>
              boosting your productivity and helping you{" "}
              <span className="text-primary">make 10x more money.</span>
            </p>
            <GetStartedButton />
          </div>
        </div>

        <div className="z-20 p-2 overflow-hidden my-12 rounded-2xl w-full h-full border bg-white max-w-[1440px] mx-auto">
          <Image
            src="/app.png"
            width={1916}
            height={1025}
            alt="main app"
            className="rounded-2xl z-20"
          />
        </div>
      </div>
      <BentoGrid />
      <Pricing />
      <Footer />
    </main>
  );
}
