import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VercelAnalytics } from "@/components/VercelAnalytics";
import { AUTHOR_NAME, AUTHOR_GITHUB } from "@/lib/author";
import { StudentModeProvider } from "@/context/StudentModeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PriceGenie AI — Your wish for the best price granted",
    template: "%s | PriceGenie AI",
  },
  description:
    "PriceGenie AI finds the true lowest price in Australia. Compare JB Hi-Fi, Harvey Norman, Amazon AU & more. Coupons, student discounts, cashback & AI buying advice.",
  keywords: [
    "PriceGenie AI",
    "price comparison Australia",
    "student discounts Australia",
    "coupon codes Australia",
    "JB Hi-Fi deals",
    "AI shopping assistant",
  ],
  authors: [{ name: AUTHOR_NAME, url: AUTHOR_GITHUB }],
  creator: AUTHOR_NAME,
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "PriceGenie AI — Your wish for the best price granted",
    description:
      "AI shopping Genie helps Australian students find true lowest prices.",
    locale: "en_AU",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1220",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-AU"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body
        className={`${geistSans.className} min-h-full flex flex-col bg-[#060a12] text-base leading-normal text-slate-200 antialiased`}
      >
        <StudentModeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <VercelAnalytics />
        </StudentModeProvider>
      </body>
    </html>
  );
}
