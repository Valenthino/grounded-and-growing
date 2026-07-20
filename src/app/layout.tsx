import type { Metadata } from "next";
import { Caveat, Cormorant_Garamond, PT_Sans } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — The Life Planner`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "life planner",
    "undated planner",
    "goal setting",
    "habit tracker",
    "self-care",
    "intentional living",
    "Grounded and Growing",
  ],
  openGraph: {
    title: `${site.name} — The Life Planner`,
    description: site.tagline,
    url: site.url,
    siteName: site.name,
    type: "website",
    images: [{ url: "/planner/cover.jpg", width: 912, height: 1278, alt: `${site.name} planner cover` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — The Life Planner`,
    description: site.tagline,
    images: ["/planner/cover.jpg"],
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
      className={`${cormorant.variable} ${ptSans.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
