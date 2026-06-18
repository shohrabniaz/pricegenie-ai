import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { VercelAnalytics } from "@/components/VercelAnalytics";
import { AuthShell } from "@/components/AuthShell";
import { AUTHOR_NAME } from "@/lib/author";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { AuthProvider } from "@/context/AuthContext";
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
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    `${APP_NAME} finds the true lowest price in Australia. Compare JB Hi-Fi, Harvey Norman, Amazon AU & more. Coupons, student discounts, cashback & AI buying advice.`,
  keywords: [
    APP_NAME,
    "price comparison Australia",
    "student discounts Australia",
    "coupon codes Australia",
    "JB Hi-Fi deals",
    "AI shopping assistant",
  ],
  authors: [{ name: AUTHOR_NAME }],
  creator: AUTHOR_NAME,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", sizes: "32x32", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
  openGraph: {
    title: `${APP_NAME} — ${APP_TAGLINE}`,
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
        <AuthProvider>
          <StudentModeProvider>
            <AuthShell>{children}</AuthShell>
            <VercelAnalytics />
          </StudentModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
