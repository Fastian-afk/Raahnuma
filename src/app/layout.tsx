import type { Metadata } from "next";
import { Inter, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const notoNaskh = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh",
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Raahnuma — AI Benefits Navigator | Pakistan Social Protection",
  description:
    "AI-powered guide to Pakistan's social safety net. Check your eligibility for BISP Kafaalat, Sehat Card, Taleemi Wazaif, Nashonuma and more. Available in Urdu, Sindhi, Pashto, Punjabi & Balochi.",
  keywords: [
    "Raahnuma", "BISP", "Benazir Income Support", "Kafaalat", "Sehat Card",
    "Taleemi Wazaif", "Nashonuma", "Pakistan benefits", "social protection",
    "eligibility checker", "AI navigator", "8171", "NSER", "PMT score"
  ],
  openGraph: {
    title: "Raahnuma — رہنما | AI Benefits Navigator",
    description: "Your guide to Pakistan's social safety net. Find out what you may qualify for.",
    type: "website",
    locale: "en_PK",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${notoNaskh.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-surface-primary text-cream antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
