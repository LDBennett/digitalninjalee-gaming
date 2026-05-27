import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./ClientLayout";
import { Navigation } from "@/src/components/ui/Navigation";

const inter = Inter({ subsets: ["latin"] });

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
      <body
        className={`${inter.className} bg-gray-950 text-white min-h-screen`}
      >
        <ClientLayout>
          <div className="flex min-h-screen">
            <Navigation />
            <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 pb-20 md:pb-8 overflow-auto">
              {children}
            </main>
          </div>
        </ClientLayout>
      </body>
    </html>
  );
}
