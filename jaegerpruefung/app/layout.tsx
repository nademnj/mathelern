import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jägerprüfung Trainer",
  description: "Prepare for the German hunting licence exam: German originals, English translation, AI tutor and quizzes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <header className="border-b border-border bg-surface">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span aria-hidden className="text-xl">🦌</span>
              Jägerprüfung Trainer
            </Link>
            <div className="flex gap-4 text-sm text-muted">
              <Link href="/" className="hover:text-text">Sections</Link>
              <Link href="/quiz/all" className="hover:text-text">Mock exam</Link>
              <Link href="/agent" className="hover:text-text">Collector agent</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
