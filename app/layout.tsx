import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { INTRO_GATE_SCRIPT, IntroSplash } from "@/components/intro-splash";
import { PulseProvider } from "@/lib/store/pulse-store";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pulsepath",
  description:
    "Short home workouts on a path — streaks, XP, and daily habits that pull you back.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <script dangerouslySetInnerHTML={{ __html: INTRO_GATE_SCRIPT }} />
        <IntroSplash />
        <PulseProvider>{children}</PulseProvider>
      </body>
    </html>
  );
}
