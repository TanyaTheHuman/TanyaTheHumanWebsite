import type { Metadata, Viewport } from "next";
import { EB_Garamond } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  weight: ["400"],
  style: ["normal", "italic"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Tanya, the human",
  description: "Tanya Hollick - Product Designer",
  openGraph: {
    title: "Tanya, the human",
    description: "Tanya Hollick - Product Designer",
    // Image from app/opengraph-image.jpg (Next.js file convention)
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body
        className={`${ebGaramond.variable} bg-cream text-ink min-h-screen font-serif [font-feature-settings:"dlig"_1,"hlig"_1,"fina"_1,"kern"_1,"rlig"_1]`}
      >
        {children}
      </body>
    </html>
  );
}
