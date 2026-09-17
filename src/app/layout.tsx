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
  title: "Rapid Turn — FRC hex shaft configurator",
  description:
    "Configure a 0.5 inch 7075-T6 FRC hex shaft, preview it in 3D, see a price estimate, and download a matching STEP. Free — not for sale.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="border-b border-steel-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rapid-600 text-sm font-bold text-white">
                RT
              </span>
              <span className="text-xl font-bold text-steel-900">
                Rapid<span className="text-rapid-600">Turn</span>
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-steel-600 sm:gap-6">
              <Link href="/" className="hover:text-rapid-600">
                Configurator
              </Link>
              <Link href="/about" className="hover:text-rapid-600">
                About
              </Link>
              <span className="hidden rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200 sm:inline">
                Not for sale
              </span>
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-steel-100 to-white">
          {children}
        </main>
        <footer className="border-t border-steel-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-steel-500 sm:flex-row sm:items-center sm:justify-between">
            <p>Rapid Turn — bar-fed lathe parts for FRC teams.</p>
            <p>Estimates are placeholders. Buying comes later.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
