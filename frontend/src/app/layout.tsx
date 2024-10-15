import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./(marketing)/_components/navbar/navbar";
import { Providers } from "../components/providers/providers";
import { ThemeProvider } from "../components/providers/theme-provider";

export const metadata: Metadata = {
  title: "Notepod",
  description: "Write documentation faster",
  icons: {
    icon: [
      {
        url: "/icon1.svg",
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
      <body>
        <Navbar />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="notepod-theme"
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
