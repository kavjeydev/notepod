"use client";

import { Space_Grotesk } from "next/font/google";
import { Lato } from "next/font/google";
import { ReactLenis } from "@studio-freight/react-lenis";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import Navbar from "./_components/navbar/navbar";
import { Button, NextUIProvider, Spinner, Modal } from "@nextui-org/react"; // Import Modal and Text

import { useRouter } from "next/navigation";
import { AnimatedBeamDemo } from "./_components/animated-beam/animated-beam";
import { AnimatedGridPatternDemo } from "./_components/animated-grid/animated-grid";
import { ParticlesDemo } from "./_components/particles/particles";
import { BentoDemo } from "./_components/bento-grid/bento-grid";
import { ArcadeEmbed } from "./_components/arcade-embed";
import VideoModal from "./_components/video-modal/video-modal";

const space = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space",
  weight: ["300", "400", "500", "600", "700"],
});

const lato = Lato({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space",
  weight: ["100", "300", "400", "700"],
});

export default function Home() {
  const router = useRouter();

  const gotoDocuments = () => {
    router.push("/documents");
  };
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <NextUIProvider className="dark:bg-black">
      <ReactLenis root options={{ lerp: 0.1, duration: 1.5 }}>
        <Navbar />

        <div className="fixed top-0 h-full w-full pointer-events-none">
          <ParticlesDemo />
        </div>

        <div className="flex relative top-[80px] w-[100vw] h-[93vh] ">
          <div className="flex w-[50vw] ml-[100px]">
            <div className="flex flex-col pl-8 gap-[25px] mt-[150px]">
              <h1
                className="font-spaceg text-[4.2875rem] font-semibold tracking-tighter leading-[4.29rem] w-[624px]
              bg-gradient-to-t dark:from-default-400 dark:via-default-600 dark:to-white
              from-default-600 via-default-800 to-black
              inline-block text-transparent bg-clip-text overflow-visible"
              >
                The <span className="">AI-Powered</span> Text Editor for
                Developers{" "}
              </h1>
              <h6 className="text-default-500 text-lg leading-[30px] w-[500px]">
                Our AI learns about any codebase, answers any questions, and
                writes industry standard technical documents for you!
              </h6>

              <div className="mt-[20px] flex gap-[20px]">
                {isLoading && <Spinner size="md" />}
                {isAuthenticated && !isLoading && (
                  <Button
                    className="bg-maincolor text-white min-w-[150px] z-[9]"
                    size="lg"
                    radius="full"
                    onClick={gotoDocuments}
                  >
                    <Link href="/documents">Enter Notepod</Link>
                  </Button>
                )}
                {!isAuthenticated && !isLoading && (
                  <Button
                    className="bg-maincolor text-white min-w-[150px] z-[99999]"
                    size="lg"
                    radius="full"
                  >
                    Try for free
                  </Button>
                )}

                {/* <Button
                  className="text-text-color bg-bgcolor min-w-[150px] z-[99999]"
                  size="lg"
                  radius="full"
                  variant="ghost"
                >
                  Watch a demo&nbsp;<span className="mt-[3px]">▶</span>
                </Button> */}
                <VideoModal />
                {/* <video src="/notepod_demo.mp4" className="z-[99999]" /> */}
                {/* <ArcadeEmbed /> */}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center w-[50vw]  h-[90vh] mr-20">
            {/* <Cardy /> */}
            <div className="absolute w-full h-[100vh] top-8 opacity-80">
              <AnimatedGridPatternDemo />
            </div>
            <AnimatedBeamDemo />
            {/* <Image src="/placeholder.png" alt="something" height={409} width={571}/> */}
          </div>
        </div>

        <div className=" pl-24 pr-24 pb-24">
          <BentoDemo />
        </div>

        {/* <DescCard /> */}
      </ReactLenis>
    </NextUIProvider>
  );
}
