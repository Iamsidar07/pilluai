import Image from "next/image";

export default function BentoGrid() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <p className="text-center text-base/7 font-semibold text-primary">
          Explore PilluAI Features
        </p>
        <h2 className="mx-auto mt-2 max-w-lg text-pretty text-center text-4xl font-medium tracking-tight text-gray-950 sm:text-5xl">
          Supercharge your productivity with AI-powered tools.
        </h2>

        {/* Grid container */}
        <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-2 lg:auto-rows-min">
          {/* Chat with YouTube feature */}
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-[#edf1f5]"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-lg">
              <div className="px-8 pb-3 pt-8">
                <h3 className="mt-2 text-lg font-medium tracking-tight text-gray-950 text-center">
                  Chat with YouTube Videos
                </h3>
                <p className="mt-2 text-sm text-gray-600 text-center">
                  Instantly interact with YouTube videos, ask questions, and get
                  insights from any video content.
                </p>
              </div>
              <div className="relative w-full">
                <Image
                  className="object-cover object-top w-full h-auto"
                  src="/chat_with_youtube.png"
                  alt="Chat with YouTube"
                  width={905}
                  height={490}
                />
              </div>
            </div>
          </div>

          {/* Chat with PDFs feature */}
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-[#edf1f5]"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-lg">
              <div className="px-8 pt-8">
                <h3 className="mt-2 text-lg font-medium tracking-tight text-gray-950 text-center">
                  Chat with PDF Documents
                </h3>
                <p className="mt-2 text-sm text-gray-600 text-center">
                  Upload your PDFs and interact with them using AI to find
                  important details or summaries in seconds.
                </p>
              </div>
              <div className="relative flex justify-center mt-8">
                <Image
                  src="/chat_with_pdf.png"
                  alt="Chat with PDF"
                  width={1293}
                  height={596}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Chat with Images feature */}
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-[#edf1f5]"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-lg">
              <div className="px-8 pt-8">
                <h3 className="mt-2 text-lg font-medium tracking-tight text-gray-950 text-center">
                  Chat with Images
                </h3>
                <p className="mt-2 text-sm text-gray-600 text-center">
                  Extract insights, analyze, or ask questions about your
                  uploaded images with AI assistance.
                </p>
              </div>
              <div className="relative mt-8">
                <Image
                  src="/chat_with_image.png"
                  alt="Chat with Images"
                  width={1274}
                  height={367}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Chat with Websites feature */}
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-[#edf1f5]"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-lg">
              <div className="px-8 pb-3 pt-8">
                <h3 className="mt-2 text-lg font-medium tracking-tight text-gray-950 text-center">
                  Chat with Websites
                </h3>
                <p className="mt-2 text-sm text-gray-600 text-center">
                  Input any website and let the AI provide summaries,
                  information, or answers from the page content.
                </p>
              </div>
              <div className="relative mt-8">
                <Image
                  src="/chat_with_website.png"
                  alt="Chat with Websites"
                  width={1163}
                  height={468}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Notion-like Text Editor */}
          <div className="relative lg:col-span-2 ">
            <div className="absolute inset-0 rounded-lg border bg-white"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-lg">
              <div className="px-8 pt-8">
                <h3 className="mt-2 text-lg font-medium tracking-tight text-gray-950 text-center">
                  Notion-like Text Editor
                </h3>
                <p className="mt-2 max-w-lg mx-auto text-sm text-gray-600 text-center">
                  Write notes, organize thoughts, and collaborate with our
                  powerful, minimalistic text editor.
                </p>
              </div>
              <div className="relative flex justify-center">
                <Image
                  src="/notion_like_editor.png"
                  alt="Notion-like Editor"
                  width={464}
                  height={457}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
