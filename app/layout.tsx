import type { Metadata, Viewport } from "next";
import { Archivo, DM_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { AnalyticsIdentity } from "@/components/analytics/analytics-identity";
import { InteractionTracker } from "@/components/analytics/interaction-tracker";
import { INTRO_GATE_SCRIPT, IntroSplash } from "@/components/intro-splash";
import { ToastProvider } from "@/components/ui/toast";
import { PulseProvider } from "@/lib/store/pulse-store";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pulsepath — Train a little, every day",
    template: "%s · Pulsepath",
  },
  description:
    "Short, coached home workouts on a path you can finish. Programs, live classes, technique courses and streaks that reward showing up.",
  applicationName: "Pulsepath",
  appleWebApp: {
    capable: true,
    title: "Pulsepath",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  colorScheme: "dark",
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
      lang="en"
      className={`${archivo.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans">
        <script dangerouslySetInnerHTML={{ __html: INTRO_GATE_SCRIPT }} />
        <IntroSplash />
        <PulseProvider>
          <AnalyticsIdentity />
          <InteractionTracker />
          <ToastProvider>{children}</ToastProvider>
        </PulseProvider>
      </body>
      {process.env.NODE_ENV === "production" && (
        <GoogleAnalytics gaId="G-3TYMG6KS5R" />
      )}
    </html>
  );
}
