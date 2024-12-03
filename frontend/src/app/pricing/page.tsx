"use client";
import { useState } from "react";
import Navbar from "../(marketing)/_components/navbar/navbar";
import { cn } from "@/lib/utils";
import PricingCard from "../(marketing)/_components/pricing-card/pricing-card";
import { Button, NextUIProvider, Spinner, Modal } from "@nextui-org/react"; // Import Modal and Text
import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <NextUIProvider className="dark:bg-black">
      <div className="flex flex-col dark:bg-black bg-white items-center min-h-screen mb-12">
        <Navbar />
        <div className="mt-56 flex flex-col gap-16 items-center w-full px-4">
          <div className="flex flex-col gap-4 max-w-3xl">
            <h1 className="text-[4rem] font-spaceg leading-[1.1] tracking-tighter w-full text-center">
              Discover the perfect plan for{" "}
              <span className="text-maincolor">your business</span>
            </h1>
            <h2 className="text-center font-4xl text-lg text-muted-foreground font-thin">
              Explore our AI plans for your business growth and success.
            </h2>
          </div>

          <div
            className="flex h-14 w-56 rounded-full dark:bg-[#222222] bg-[#DDDDDD]
          border dark:border-[#444444] border-[#BBBBBB] cursor-pointer "
          >
            <div
              className={cn(
                "flex text-muted-foreground w-1/2 m-1.5 items-center justify-center p-2 rounded-full transition-all duration-300",
                !annual
                  ? "bg-white text-maincolor"
                  : "hover:bg-[#BBBBBB] dark:hover:bg-[#444444]",
              )}
              onClick={() => {
                setAnnual(false);
              }}
            >
              Monthly
            </div>
            <div
              className={cn(
                "flex text-muted-foreground w-1/2 items-center justify-center m-1.5 rounded-full",
                annual
                  ? "bg-white text-maincolor"
                  : "hover:bg-[#BBBBBB] dark:hover:bg-[#444444]",
              )}
              onClick={() => {
                setAnnual(true);
              }}
            >
              Annual
            </div>
          </div>
          <div className="flex gap-4">
            <Card className="py-4">
              <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                <p className="text-tiny uppercase font-bold">Starter</p>
                <small className="text-default-500">12 Tracks</small>
                <h4 className="font-bold text-large">Frontend Radio</h4>
              </CardHeader>
              <CardBody className="overflow-visible py-2">
                <Image
                  alt="Card background"
                  className="object-cover rounded-xl"
                  src="https://nextui.org/images/hero-card-complete.jpeg"
                  width={270}
                />
              </CardBody>
            </Card>
            {/* <PricingCard /> */}
            <Card className="py-4">
              <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                <p className="text-tiny uppercase font-bold">Professional</p>
                <small className="text-default-500">12 Tracks</small>
                <h4 className="font-bold text-large">Frontend Radio</h4>
              </CardHeader>
              <CardBody className="overflow-visible py-2">
                <Image
                  alt="Card background"
                  className="object-cover rounded-xl"
                  src="https://nextui.org/images/hero-card-complete.jpeg"
                  width={270}
                />
              </CardBody>
            </Card>
            {/* <PricingCard /> */}
            <Card className="py-4">
              <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                <p className="text-tiny uppercase font-bold">Enterprise</p>
                <small className="text-default-500">12 Tracks</small>
                <h4 className="font-bold text-large">Frontend Radio</h4>
              </CardHeader>
              <CardBody className="overflow-visible py-2">
                <Image
                  alt="Card background"
                  className="object-cover rounded-xl"
                  src="https://nextui.org/images/hero-card-complete.jpeg"
                  width={270}
                />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </NextUIProvider>
  );
}
