"use client";
import styles from "./navbar.module.css";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";
import { Lato } from "next/font/google";
import { Button } from "@nextui-org/react";
import { useScrollTop } from "../../../../../hooks/use-scroll-top";
// import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

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

export default function Navbar() {
  var currentTheme: string = "light";
  const scrolled = useScrollTop();
  return (
    <div
      className={cn(
        "w-full h-[80px] fixed z-50 transition duration-400 ease-in-out",
        scrolled &&
          "border-b shadow-lg shadow-default-800/10 transition duration-400 ease-in-out",
      )}
    >
      <div
        className={`${styles.outer_container} ${space.variable} antialiased`}
      >
        <div className={styles.left}>
          <Image
            src="/logo_w_text.png"
            alt="logo"
            height={36}
            width={130}
            className={styles.logol}
          />
        </div>

        <div className={`${styles.middle} ${lato.variable}`}>
          <div className={styles.home}>Product</div>
          <div className={styles.home}>Pricing</div>
          <div className={styles.home}>Documentation</div>
          <div className={styles.home}>
            <span className={styles.emph}>Write Now ⤴</span>
          </div>
        </div>

        <div className={styles.right}>
          <Button
            variant="light"
            radius="full"
            size="md"
            className="text-text-color"
          >
            Log In
          </Button>
          <Button
            color="primary"
            radius="full"
            className="bg-maincolor text-white"
          >
            Sign Up
          </Button>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
