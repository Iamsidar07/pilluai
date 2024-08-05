import GetStartedButton from "@/components/GetStartedButton";
import Pricing from "@/components/Pricing";
import { cn } from "@/lib/utils";
import Image from "next/image";

const FEATURES = [
  {
    title: "Converse with Your YouTube Videos",
    description:
      "Ever come across an hour-long video but don't have the time to watch it? With PilluAI, you can ask specific questions and get the information you need without watching the entire video.",
    image: "/a.png",
  },
  {
    title: "Dive Deep into Your Interests",
    description:
      "Whether you're binge-watching Kurzgesagt at 2 AM, uncovering the mysteries of the universe, finishing up your research paper, or working on your next billion-dollar product idea, PilluAI has you covered.",
    image: "/a.png",
  },
  {
    title: "Optimize Your Podcast Listening",
    description:
      "Instead of spending hours mindlessly listening to podcasts, give PilluAI all the podcasts you want to listen to. Ask specific questions that could help you and your business, saving you valuable time.",
    image: "/a.png",
  },
  {
    title: "Chat with Websites and PDF Documents",
    description:
      "Interact with websites and PDF documents just like you would with a person. Get the information you need quickly and efficiently without having to sift through pages of content.",
    image: "/a.png",
  },
  {
    title: "Notion-like Editor for Note-taking",
    description:
      "Experience a beautiful and intuitive Notion-like editor within PilluAI. Seamlessly write and organize your notes, thoughts, and ideas all in one place.",
    image: "/a.png",
  },
];

export default async function Home() {
  return (
    <main className="p-4 lg:p-8 grainy-light w-full overflow-y-auto flex-1 rounded-2xl bg-pink-50">
      <div className="max-w-7xl mx-auto flex flex-col items-center py-24 lg:py-32">
        <div className="mx-auto max-w-2xl text-left sm:text-center">
          <h2 className="font-bold text-gray-600">
            Your interactive whiteboard comapanion
          </h2>
          <h1 className="text-3xl sm:text-5xl mt-2 font-bold capitalize">
            Your ultimate whiteboard... on{" "}
            <span className="font-extrabold text-primary">steroids</span>
          </h1>
          <p className="mt-3 text-lg leading-6 text-gray-500">
            Introducing <span className="text-primary font-bold">Pillu AI</span>{" "}
            <br /> <br />
            If you&apos;re a developer, video editor, researcher, or anyone who
            works with their brain,{" "}
            <span className="text-primary">
              PilluAI can help you think 10x faster, boosting your productivity
              and helping you make 10x more money.
            </span>
          </p>
          <GetStartedButton />
        </div>
        <div className="relative pt-16 overflow-hidden my-12 rounded-2xl">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <Image
              src="/app.png"
              alt="App screenshot"
              width={2432}
              height={1442}
              quality={100}
              className="mb-[-0%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
            />
            <div aria-hidden={true}>
              <div
                className="absolute bottom-0 top-0 -inset-x-32 bg-gradient-to-t from-white/95 pt-[5%]"
                aria-hidden={true}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-8 md:gap-24">
          {FEATURES.map(({ description, title, image }, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={cn(
                  "max-w-3xl relative mx-auto p-2 ring-1 ring-pink-900/10 rounded-2xl",
                  {
                    "bg-orange-50": i === 0,
                    "bg-green-50": i === 1,
                    "bg-blue-50": i === 2,
                    "bg-purple-50": i === 3,
                  }
                )}
              >
                <Image
                  alt={title}
                  src={image}
                  width={1468}
                  height={881}
                  className="rounded-2xl"
                />
              </div>
              <div
                className={cn("mt-4  leading-6", {
                  "text-center max-w-2xl": i % 2 !== 0,
                  "md:ml-[50%] border-l-2 border-pink-300 pl-4  ": i % 2 === 0,
                })}
              >
                <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
                <p className="mt-2 text-lg text-gray-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Pricing />
    </main>
  );
}
