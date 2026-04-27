import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { GlobalLoaderProvider } from "@/components/GlobalLoaderContext";
import GlobalLoader from "@/components/GlobalLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TravelAgent - AI 智慧旅遊規畫助理",
  description: "專為專業旅遊顧問打造的 AI 智慧行程規劃與管理平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-slate-50/50`}
        suppressHydrationWarning
      >
        <GlobalLoaderProvider>
          <Header />
          {children}
          <Toaster />
          <GlobalLoader />
        </GlobalLoaderProvider>
      </body>
    </html>
  );
}
