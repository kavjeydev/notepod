import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "../components/providers/theme-provider";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { Toaster } from "sonner";

import { ModalProvider } from "@/components/providers/modal-provider";
import { ClerkProvider } from "@clerk/clerk-react";

export const metadata: Metadata = {
  title: "Notepod - Technical Docs in Seconds",
  description: "Write documentation faster",
  icons: {
    icon: [
      {
        url: "/webheading.svg",
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
      <body
        suppressHydrationWarning
        className="dark:bg-[#121212] h-full bg-[#FFFFFF] overflow-x-hidden overscroll-contain"
      >
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
            storageKey="notepod-theme"
          >
            <Toaster position="bottom-center" />
            <ModalProvider />
            {children}
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
