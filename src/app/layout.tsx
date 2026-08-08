import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Header } from "@/components/layout/Header";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StoneFinder",
  description: "Знайди або опублікуй залишок каменю.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6">
          <Header />
        </div>

        {children}
      </body>
    </html>
  );
}
