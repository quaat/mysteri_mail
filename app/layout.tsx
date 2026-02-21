import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

import { ClientSettingsApplier } from "@/components/ClientSettingsApplier";

export const metadata: Metadata = {
  title: "Mysteri Mail",
  description: "Wacky story-driven math mysteries for grades 2–5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="mm-paper bg-[#fbf6e9] text-black">
        <ClientSettingsApplier>
          <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fbf6e9]/80 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">📬</span>
                <span className="text-base font-black tracking-tight">Mysteri Mail</span>
              </Link>
              <nav className="flex items-center gap-3 text-sm font-semibold">
                <Link className="hover:underline" href="/parents">
                  Parents/Teacher
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-6 md:py-10">{children}</main>
          <footer className="mx-auto max-w-5xl px-4 pb-10 text-xs text-black/60">
            <p>
              Built for learning + laughs. No accounts. No tracking. Just suspicious math.
            </p>
          </footer>
        </ClientSettingsApplier>
      </body>
    </html>
  );
}
