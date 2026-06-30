import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rapid Turn — Instant Lathe Parts",
  description:
    "Configure, quote, and order turned parts in seconds. Automated G-code and Haas CL-1 production.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="border-b border-steel-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rapid-600 text-sm font-bold text-white">
                RT
              </span>
              <span className="text-xl font-bold text-steel-900">
                Rapid<span className="text-rapid-600">Turn</span>
              </span>
            </Link>
            <nav className="flex gap-6 text-sm font-medium text-steel-600">
              <Link href="/shop" className="hover:text-rapid-600">
                Configure & Quote
              </Link>
              <Link href="/machine" className="hover:text-rapid-600">
                Machine
              </Link>
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-steel-100 to-white">
          {children}
        </main>
      </body>
    </html>
  );
}
