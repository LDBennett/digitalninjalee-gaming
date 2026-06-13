import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ClientLayout } from "./ClientLayout";
import { Navigation } from "@/src/lib/frontend/widgets/navigation";

const inter = Inter({ subsets: ["latin"] });
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  title: {
    default: "Backlog Bunker - DigitalNinjaLee",
    template: "%s | Backlog Bunker",
  },
  description:
    "Personal gaming dashboard for tracking and logging games played",
  icons: {
    icon: "/logos/dnl-logo--white.png",
    apple: "/logos/dnl-logo--white.png",
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
          <div className="flex min-h-screen items-start">
            <Navigation />
            <main className="flex-1 overflow-auto p-4 pt-16 pb-28 md:p-8 md:pt-8 md:pb-8">
              {children}
            </main>
          </div>
        </ClientLayout>
      </body>
    </html>
  );
}
