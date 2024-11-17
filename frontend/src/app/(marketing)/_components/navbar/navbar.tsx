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
import { FloatingDockDemo } from "../floating-dock/floating-dock";

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
        "w-full h-[80px] fixed transition duration-400 ease-in-out z-[9999999]",
        scrolled &&
          "border-b shadow-sm shadow-default-800/10 transition duration-400 ease-in-out",
      )}
    >
      <div
        className="flex justify-between items-center fixed z-50 pl-[115px]
      pr-[115px] pb-[10px] pt-[10px] w-[100vw] h-[80px] backdrop-blur-[20px] "
      >
        <div className="flex items-center justify-center border-r-[10] font-bold text-[20px]">
          <Image
            src="/new_logo_black.png"
            alt="logo"
            height={30}
            width={110}
            className="dark:hidden"
          />

          <Image
            src="/new_logo_white.png"
            alt="logo"
            height={30}
            width={110}
            className="hidden dark:block"
          />
          {/* notepod */}
        </div>

        <div className="flex gap-12 justify-center items-center">
          <div
            className="flex text-text-color pl-[10px] pr-[10px] text-sm font-light rounded-full hover:text-muted-foreground transition cursor-pointer"
            // size="sm"
            // variant="light"
          >
            Product
          </div>
          <div
            className="flex text-text-color pl-[10px] pr-[10px] text-sm rounded-full hover:text-muted-foreground cursor-pointer"
            // size="sm"
            // variant="light"
          >
            Pricing
          </div>
          <div
            className="flex text-text-color pl-[10px] pr-[10px] text-sm rounded-full hover:text-muted-foreground cursor-pointer"
            // size="sm"
            // variant="light"
          >
            Documentation
          </div>
          <div
            className="flex text-text-color pl-[10px] pr-[10px] text-sm hover:text-muted-foreground rounded-full justify-center items-center cursor-pointer"
            // size="sm"
            // variant="light"
            onClick={() => {
              router.push("/community");
            }}
          >
            <span className="text-text-color font-bold">Community ⤴</span>
          </div>
        </div>
        {/* <div className="block items-center justify-center">
          <FloatingDockDemo />
        </div> */}

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
