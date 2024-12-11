"use client";

import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
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
import TiltCard from "./_components/tilt-card/tilt-card";
import SparklesText from "@/components/ui/sparkles-text";
import { MarqueeDemo } from "./_components/marquee-company/marquee-demo";
import { useTheme } from "next-themes";
import { MagicCard } from "@/components/ui/magic-card";
import { MagicCardDemo } from "./_components/magic-card/magic-card";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { RetroGridDemo } from "./_components/retro-grid/retro-grid";
import { useEffect } from "react";
import { CardDemo } from "./_components/shad-card/card-main";
import { Badge } from "@/components/ui/badge";
import { DotPatternDemo } from "./_components/dot-pattern/dot-pattern";

const space = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space",
  weight: ["300", "400", "500", "600", "700"],
});

const code_font = IBM_Plex_Mono({
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
  const { theme, setTheme } = useTheme();

  const gotoDocuments = () => {
    router.push("/documents");
  };
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <NextUIProvider className="dark:bg-darkdarkbg bg-lightlightbg">
      {/* <ReactLenis root options={{ lerp: 0.1, duration: 1.5 }}> */}
      <Navbar />

      <div className="absolute top-0 h-full w-full pointer-events-none z-0">
        <ParticlesDemo />
      </div>

      <div className="flex relative top-[50px] w-[100vw] h-[65vh] ">
        <div className="flex flex-col items-center w-[100vw]">
          <div className="flex flex-col pl-8 gap-[25px] mt-[120px] items-center">
            <h1
              className="font-spaceg text-[4.2875rem] font-bold tracking-tighter leading-[4.29rem] w-[650px]
                dark:text-white text-black inline-block bg-clip-text overflow-visible text-center"
            >
              <span>The </span>
              <SparklesText
                text="AI-Powered"
                className="text-[4.2875rem] inline-block"
                sparklesCount={8}
              />
              <span> Text Editor for Developers</span>
            </h1>
            <h6 className="text-default-800 text-medium leading-[30px] w-[500px] text-center">
              Our AI learns about any codebase, answers any questions, and
              writes industry standard technical documents for you!
            </h6>

            <div className="mt-[10px] flex gap-[15px]">
              {isLoading && <Spinner size="md" />}
              {isAuthenticated && !isLoading && (
                <Button
                  className="dark:bg-maincolor bg-third text-white min-w-[150px] z-[9]"
                  size="md"
                  radius="sm"
                  onClick={gotoDocuments}
                >
                  <Link href="/documents">Enter Notepod</Link>
                </Button>
              )}
              {!isAuthenticated && !isLoading && (
                <Button
                  className="dark:bg-maincolor bg-third text-white min-w-[150px] z-[9]"
                  size="md"
                  radius="sm"
                >
                  Try for free
                </Button>
              )}
              <VideoModal />
            </div>
          </div>
        </div>

        {/* <div className="flex items-center justify-center w-[50vw]  h-[85vh] mr-20">
            <div className="absolute w-full h-[100vh] top-8 opacity-80">
              <AnimatedGridPatternDemo />
            </div>
            <AnimatedBeamDemo />
          </div> */}
        <RetroGridDemo />
      </div>

      {/* <div className=" pl-24 pr-24 pb-24">
          <BentoDemo />
        </div> */}
      <MarqueeDemo />
      {/* <TiltCard>
          <div className="bg-red-500 w-full h-96">Hello</div>
        </TiltCard> */}

      {/* <DescCard /> */}
      <div
        className="flex w-full h-full mt-10 items-center justify-center
pt-20 pb-20 z-50"
      >
        <div className="flex flex-col gap-8 z-10 ">
          <div className="text-[3.3rem] font-spaceg tracking-tighter font-medium">
            Get to know Notepod.
          </div>
          <CardDemo />
          {/* <MagicCardDemo /> */}
        </div>
        {/* <div className="relative mt ml">
            <img src="/dark_info.png" height={100} width={800} />
          </div> */}
      </div>

      <div
        className="h-[60vh] w-full flex gap-4
      bg-gradient-to-tr dark:from-purple-500 dark:to-violet-500 mb-20 items-center
      from-third to-orange-300"
      >
        <div
          className="flex items-center justify-center text-[3.5rem]
          h-full w-[50vw] font-spaceg text-white pl-32
          font-medium leading-[1] mt-0 mb-10"
        >
          <div className="flex flex-col gap-4">
            <Badge className="w-fit bg-black/20 dark:bg-white/20 dark:text-white text-white">
              Notepod AI
            </Badge>
            <div className="z-10 text-white tracking-tighter font-medium">
              Speed up the learning process for large codebases.
            </div>
          </div>
        </div>
        <div className="flex h-full w-[50vw] p-20 items-center justify-center">
          <video autoPlay muted loop playsInline className="rounded-lg z-10">
            <source src="/ai_func.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <DotPatternDemo />
        </div>
      </div>
      {/* </ReactLenis> */}
    </NextUIProvider>
  );
}
