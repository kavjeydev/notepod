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
      <div className="flex justify-between items-center fixed z-50 pl-[115px] pr-[115px] pb-[10px] pt-[10px] w-[100vw] h-[80px] backdrop-blur-[20px]">
        <div className="flex items-center justify-center border-r-[10] pt-[4px]">
          <Image src="/logo_w_text.png" alt="logo" height={36} width={130} />
        </div>

        <div className="flex gap-[60px]">
          <div className="flex text-text-color pl-[10px] pr-[10px]">
            Product
          </div>
          <div className="flex text-text-color pl-[10px] pr-[10px]">
            Pricing
          </div>
          <div className="flex text-text-color pl-[10px] pr-[10px]">
            Documentation
          </div>
          <div className="flex text-text-color pl-[10px] pr-[10px]">
            <span className="text-text-color font-bold">Write Now ⤴</span>
          </div>
        </div>

        <div className="flex gap-[15px]">
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
