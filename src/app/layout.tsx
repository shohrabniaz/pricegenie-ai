import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StudentModeProvider } from "@/context/StudentModeContext";
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
  title: {
    default: "PriceMate Australia — AI Shopping Agent",
    template: "%s | PriceMate Australia",
  },
  description:
    "Find the true lowest price in Australia. Compare JB Hi-Fi, Harvey Norman, Amazon AU & more. Coupons, student discounts, cashback & AI buying advice.",
  keywords: [
    "price comparison Australia",
    "student discounts Australia",
    "coupon codes Australia",
    "JB Hi-Fi deals",
    "AI shopping assistant",
  ],
  authors: [{ name: "Shohrab Niaz", url: "https://github.com/shohrabniaz" }],
  creator: "Shohrab Niaz",
  manifest: "/manifest.json",
  openGraph: {
    title: "PriceMate Australia — True Lowest Price Finder",
    description:
      "AI-powered shopping assistant for Australian students and savvy shoppers.",
    locale: "en_AU",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-AU"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#060a12] text-slate-200">
        <StudentModeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </StudentModeProvider>
      </body>
    </html>
  );
}
