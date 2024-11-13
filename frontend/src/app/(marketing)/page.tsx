"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { Space_Grotesk } from "next/font/google";
import { Lato } from "next/font/google";
import { ReactLenis } from "@studio-freight/react-lenis";
import { Button, NextUIProvider, Spinner } from "@nextui-org/react";
import Cardy from "./_components/card/card";
import DescCard from "./_components/desccard/desccard";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import Navbar from "./_components/navbar/navbar";
import { useRouter } from "next/navigation";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { AnimatedBeamDemo } from "./_components/animated-beam/animated-beam";
import { GridPatternDemo } from "./_components/grid-pattern/grid-pattern";
import { AnimatedGridPatternDemo } from "./_components/animated-grid/animated-grid";
import { ParticlesDemo } from "./_components/particles/particles";
import { BentoDemo } from "./_components/bento-grid/bento-grid";
import { FloatingDockDemo } from "./_components/floating-dock/floating-dock";

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
                className="font-spaceg text-[4.2875rem] font-semibold tracking-tighter leading-[4.2875rem] w-[624px]
              bg-gradient-to-t dark:from-default-400 dark:via-default-600 dark:to-white
              from-default-600 via-default-800 to-black
              inline-block text-transparent bg-clip-text"
              >
                Technical docs for any codebase{" "}
                <span className="">in seconds.</span>
              </h1>
              <h6 className="text-default-500 text-lg leading-[30px] w-[500px]">
                Our AI learns about any codebase, answers any questions, and
                writes industry standard technical documents for you!
              </h6>

              <div className="mt-[20px] flex gap-[20px]">
                {isLoading && <Spinner size="md" />}
                {isAuthenticated && !isLoading && (
                  <Button
                    className="bg-maincolor text-white min-w-[150px]"
                    size="lg"
                    radius="full"
                    onClick={gotoDocuments}
                  >
                    <Link href="/documents">Enter Notepod</Link>
                  </Button>
                )}
                {!isAuthenticated && !isLoading && (
                  <Button
                    className="bg-maincolor text-white min-w-[150px]"
                    size="lg"
                    radius="full"
                  >
                    Try for free
                  </Button>
                )}

                <Button
                  className="text-text-color bg-bgcolor min-w-[150px]"
                  size="lg"
                  radius="full"
                  variant="ghost"
                >
                  Watch a demo&nbsp;<span className="mt-[3px]">▶</span>
                </Button>

                {/* <Button
                      variant="ghost"
                      radius="full"
                      size="lg"
                      className="text-text-color"
                    >
                      Watch a demo&nbsp;<span className={styles.arrow}>▶</span>
                    </Button> */}
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

        {/* <div className="flex items-center justify-center">
          <div
            className="font-spaceg flex flex-col items-center justify-center h-full w-[70vw]
          text-[36px] font-normal mt-[80px] mb-[100px] text-center gap-8"
          >
            <div className="flex flex-row h-[400px] w-[70vw] bg-[#242327] dark:bg-[#ececff] rounded-2xl">
              <div
                className="flex flex-col text-left font-spaceg text-sm text-white
              dark:text-black h-full w-[35vw] pl-24 justify-center gap-4"
              >
                <span>DATA VALIDATION</span>
                <span className="text-4xl font-sans">
                  AI trained on industry grade documentation.
                </span>
                <span className="font-md font-sans text-muted-foreground">
                  Curated from a diverse range of high-quality sources, it
                  ensures comprehensive coverage while maintaining rigorous
                  standards.
                </span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="flex flex-wrap h-[100px] w-[35vw] justify-center items-center gap-20">
                  <img
                    className=" h-[50px] w-[50px] bg-slate-100 dark:bg-gray-900 rounded-sm"
                    src="./X_logo.jpg"
                  ></img>
                  <img
                    className=" h-[50px] w-[50px] bg-slate-100 dark:bg-gray-900 rounded-sm"
                    src="./reddit.png"
                  ></img>
                  <img
                    className=" h-[50px] w-[50px] bg-slate-100 dark:bg-gray-900 rounded-sm"
                    src="./stripe.png"
                  ></img>
                </div>
                <div className="flex flex-wrap h-[100px] w-[35vw] justify-center items-center gap-20">
                  <img
                    className=" h-[50px] w-[50px] bg-slate-100 dark:bg-gray-900 rounded-sm"
                    src="./github.png"
                  ></img>
                  <img
                    className=" h-[50px] w-[50px] bg-slate-100 dark:bg-gray-900 rounded-sm"
                    src="./docker.jpg"
                  ></img>
                  <img
                    className=" h-[50px] w-[50px] bg-slate-100 dark:bg-gray-900 rounded-sm"
                    src="./nextjs.jpg"
                  ></img>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        <div className=" pl-24 pr-24">
          <BentoDemo />
        </div>

        {/* <DescCard /> */}
      </ReactLenis>
    </NextUIProvider>
  );
}
