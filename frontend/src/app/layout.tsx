import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./(marketing)/_components/navbar/navbar";
import { Providers } from "../components/providers/providers";
import { ThemeProvider } from "../components/providers/theme-provider";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { Toaster } from "sonner";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export const metadata: Metadata = {
  title: "Notepod",
  description: "Write documentation faster",
  icons: {
    icon: [
      {
        url: "/curved.svg",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="dark:bg-[#121212] h-full">
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="notepod-theme"
          >
            <Toaster position="bottom-center" />
            {children}
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
