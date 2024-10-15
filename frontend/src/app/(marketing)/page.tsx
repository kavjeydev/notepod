"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { Space_Grotesk } from "next/font/google";
import { Lato } from "next/font/google";
import { ReactLenis } from "@studio-freight/react-lenis";
import { Button, NextUIProvider } from "@nextui-org/react";
import Cardy from "./_components/card/card";
import DescCard from "./_components/desccard/desccard";

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
  return (
    <NextUIProvider>
      <div className="light">
        <ReactLenis root options={{ lerp: 0.1, duration: 1.5 }}>
          <div className={styles.whole_page}>
            {/* <div className={styles.rect_container}>
              <img src="/rect.png" alt="something" className={styles.image_r} />
            </div> */}

            <div className={`${styles.outer_container}`}>
              <div className={styles.left_container}>
                <div className={styles.hero}>
                  <h1
                    className={`${styles.header_one} ${space.variable} antialiased`}
                  >
                    Technical docs for{" "}
                    <span className="text-maincolor z-0">any codebase</span> in
                    seconds.
                  </h1>
                  <h6
                    className={`${styles.paragraph} ${lato.variable} antialiased`}
                  >
                    Our AI learns about any codebase, answers any questions, and
                    writes industry standard technical documents for you!
                  </h6>

                  <div className={styles.cta_container}>
                    <Button
                      className="bg-maincolor text-white min-w-[150px]"
                      size="lg"
                      radius="full"
                    >
                      Try For Free
                    </Button>
                    <Button
                      className="text-text-color bg-bgcolor min-w-[150px]"
                      size="lg"
                      radius="full"
                      variant="bordered"
                    >
                      Watch a demo&nbsp;<span className={styles.arrow}>▶</span>
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

              <div className={styles.right_container}>
                <Cardy />
                {/* <Image src="/placeholder.png" alt="something" height={409} width={571}/> */}
              </div>
            </div>

            <div className={`${styles.sell} ${space.variable}`}>
              Writing documentation has never been easier.
            </div>

            <DescCard />
          </div>
        </ReactLenis>
      </div>
    </NextUIProvider>
  );
}
