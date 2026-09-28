import { Navigation } from "@/src/lib/frontend/widgets/navigation";
import { QuickGuide } from "@/src/lib/frontend/widgets/quick-guide";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { ClientLayout } from "./ClientLayout";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Backlog Bunker - DigitalNinjaLee",
    template: "%s | Backlog Bunker",
  },
  description:
    "Personal gaming dashboard for tracking and logging games played",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Backlog Bunker",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}</Script>
        </>
      )}
      <body
        className={`${inter.className} min-h-screen bg-gray-950 text-white`}
      >
        <ClientLayout>
          <div className="flex min-h-screen">
            <Navigation />
            <main className="flex-1 p-4 md:p-8 pt-16 md:pt-6 pb-50 min-w-0">
              {children}
            </main>
          </div>
          <QuickGuide />
        </ClientLayout>
      </body>
    </html>
  );
}
