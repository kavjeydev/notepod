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
import { useConvexAuth } from "convex/react";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { Spinner } from "@nextui-org/react";
import Link from "next/link";
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

export default function Navbar() {
  var currentTheme: string = "light";
  const scrolled = useScrollTop();
  const { isAuthenticated, isLoading } = useConvexAuth();

  const router = useRouter();
  const gotoDocuments = () => {
    router.push("/documents");
  };
  return (
    <div
      className={cn(
        "w-full h-[80px] fixed z-50 transition duration-400 ease-in-out",
        scrolled &&
          "border-b shadow-sm shadow-default-800/10 transition duration-400 ease-in-out",
      )}
    >
      <div className="flex justify-between items-center fixed z-50 pl-[115px] pr-[115px] pb-[10px] pt-[10px] w-[100vw] h-[80px] backdrop-blur-[20px]">
        <div className="flex items-center justify-center border-r-[10] pt-[4px]">
          <Image
            src="/logo_w_text.svg"
            alt="logo"
            height={40}
            width={130}
            className="dark:hidden"
          />

          <Image
            src="/logo_w_text_dark.svg"
            alt="logo"
            height={40}
            width={130}
            className="hidden dark:block"
          />
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
          {isLoading && <Spinner size="sm" />}
          {!isAuthenticated && !isLoading && (
            <>
              <SignInButton mode="modal">
                <Button
                  variant="light"
                  radius="full"
                  size="md"
                  className="text-text-color"
                >
                  Log In
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button
                  color="primary"
                  radius="full"
                  className="bg-maincolor text-white"
                >
                  Sign Up
                </Button>
              </SignInButton>
            </>
          )}
          {isAuthenticated && !isLoading && (
            <>
              <Button
                color="primary"
                radius="full"
                className="bg-maincolor text-white"
                onClick={gotoDocuments}
              >
                <Link href="/documents">Enter Notepod</Link>
              </Button>
              <UserButton />
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
