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
    <NextUIProvider className="dark:bg-[121212]">
      <ReactLenis root options={{ lerp: 0.1, duration: 1.5 }}>
        <Navbar />
        <div className="flex relative top-[80px] w-[100vw] h-[93vh] ">
          <div className="flex w-[50vw] ml-[100px]">
            <div className="flex flex-col gap-[25px] mt-[150px]">
              <h1 className="font-spaceg text-[4.6875rem] font-normal tracking-tighter leading-[4.6875rem] w-[624px]">
                Technical docs for{" "}
                <span className="text-maincolor z-0">any codebase</span> in
                seconds.
              </h1>
              <h6 className="text-default-500 text-[16px] leading-[30px] w-[500px]">
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

          <div className="flex items-center justify-center w-[50vw] mt[-15px] h-[90vh]">
            <Cardy />
            {/* <Image src="/placeholder.png" alt="something" height={409} width={571}/> */}
          </div>
        </div>

        <div className="font-spaceg flex items-center justify-center h-[75px] w-[100vw] text-[36px] font-medium mt-[80px] mb-[100px]">
          Writing documentation has never been easier.
        </div>

        <DescCard />
      </ReactLenis>
    </NextUIProvider>
  );
}
