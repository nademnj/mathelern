import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { InstallHint, OfflineManager } from "@/components/OfflineManager";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jägerprüfung Trainer",
  description: "Prepare for the German hunting licence exam: German originals, English translation, AI tutor and quizzes.",
  applicationName: "Jägerprüfung",
  appleWebApp: { capable: true, title: "Jägerprüfung", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#3f6b2e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <header className="border-b border-border bg-surface pt-[env(safe-area-inset-top)]">
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
        <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
          <InstallHint />
          {children}
        </main>
        <footer className="mx-auto max-w-6xl px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <OfflineManager />
        </footer>
      </body>
    </html>
  );
}
