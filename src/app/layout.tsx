import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "PULSE | Gym PR Tracker",
  description: "A premium mobile-optimized Gym Personal Record (PR) Tracker with an integrated AI Progression Coach.",
  keywords: ["gym", "workout", "PR", "tracker", "fitness", "progressive overload", "bodybuilding"],
  authors: [{ name: "Pulse Fit" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PULSE PR",
  },
};

export const viewport: Viewport = {
  themeColor: "#090d16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#03070c] flex justify-center items-stretch selection:bg-[#00F2FE]/30 selection:text-white">
        {/* Core Mobile Container */}
        <div className="w-full max-w-md min-h-screen flex flex-col bg-[#090d16] text-[#f3f4f6] relative border-x border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-y-auto overflow-x-hidden pb-12">
          {children}
        </div>
      </body>
    </html>
  );
}
