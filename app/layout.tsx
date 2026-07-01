import type { Metadata } from "next";
import {
  Hanken_Grotesk,
  Bricolage_Grotesque,
  JetBrains_Mono,
  Kalam,
  Space_Mono,
} from "next/font/google";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-hanken",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-bricolage",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

// Landing-page fonts (reference design): Kalam (hand) + Space Mono (mono).
const kalam = Kalam({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-kalam",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DevTrack — Turn your GitHub work into a standout LinkedIn profile",
  description:
    "DevTrack scans your GitHub activity and writes copy-paste-ready LinkedIn content.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${bricolage.variable} ${jetbrains.variable} ${kalam.variable} ${spaceMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
