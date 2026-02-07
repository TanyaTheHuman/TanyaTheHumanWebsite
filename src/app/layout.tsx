import type { Metadata, Viewport } from "next";
import { EB_Garamond } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
});

export const metadata: Metadata = {
  title: "Coming Soon",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ebGaramond.variable} min-h-screen font-serif bg-cream text-ink [font-feature-settings:"dlig"_1,"hlig"_1,"fina"_1,"kern"_1,"rlig"_1]`}
      >
        {children}
      </body>
    </html>
  );
}
