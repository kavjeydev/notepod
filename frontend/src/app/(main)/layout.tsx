"use client";

import type { Metadata } from "next";

import { Spinner } from "@nextui-org/react";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import Navigation from "./_components/navigation";
import { SearchCommand } from "@/components/search-command";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="h-[100vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return redirect("/");
  }
  return (
    <div className="flex dark:bg-[#121212] ">
      <Navigation />
      <main className="flex-1 h-full overscroll-contain">
        <SearchCommand />
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
