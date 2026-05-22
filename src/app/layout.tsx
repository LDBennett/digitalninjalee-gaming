import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./ClientLayout";
import { Navigation } from "@/src/components/ui/Navigation";
import { AuthButton } from "@/src/domains/shared/auth/AuthButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Game Vault",
  description: "Personal gaming backlog tracker",
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
            <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-auto">
              {children}
            </main>
            <div className="top-3 right-1 md:right-3 absolute">
              <AuthButton />
            </div>
          </div>
        </ClientLayout>
      </body>
    </html>
  );
}
