"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type Status =
  | { state: "unsupported" | "none" | "offline-unsaved" }
  | { state: "syncing"; done: number; total: number }
  | { state: "ready" | "partial"; pages: number; savedAt: string; failed?: number };

const noop = () => () => {};

function useOnline() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("online", cb);
      window.addEventListener("offline", cb);
      return () => {
        window.removeEventListener("online", cb);
        window.removeEventListener("offline", cb);
      };
    },
    () => navigator.onLine,
    () => true
  );
}

/**
 * Registers the service worker and keeps every lesson and quiz downloaded on
 * the device. Shows a small status line, plus how to add the app to the home
 * screen if it isn't installed yet.
 */
export function OfflineManager() {
  const online = useOnline();
  const [status, setStatus] = useState<Status>({ state: "none" });
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setStatus({ state: "unsupported" });
      return;
    }
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "offline-status") setStatus(e.data as Status);
    };
    navigator.serviceWorker.addEventListener("message", onMessage);

    let cancelled = false;
    (async () => {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      // Ask the browser not to clear our storage when space runs low.
      navigator.storage?.persist?.().catch(() => {});
      const sw = reg.active ?? (await navigator.serviceWorker.ready).active;
      if (cancelled || !sw) return;
      sw.postMessage({ type: navigator.onLine ? "sync" : "status" });
    })().catch(() => setStatus({ state: "unsupported" }));

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, []);

  // Coming back online: check for new content.
  useEffect(() => {
    if (online) navigator.serviceWorker?.controller?.postMessage({ type: "sync" });
  }, [online]);

  const redownload = () => {
    navigator.serviceWorker?.controller?.postMessage({ type: "sync", force: true });
  };

  return (
    <div className="space-y-2 text-xs text-muted">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {!online && <span className="rounded-full bg-warn/15 px-2 py-0.5 font-medium text-warn">Offline</span>}
        <span>{describe(status, online)}</span>
        {online && (status.state === "ready" || status.state === "partial") && (
          <button className="underline hover:text-text" onClick={redownload}>Download again</button>
        )}
      </div>
    </div>
  );
}

function describe(s: Status, online: boolean): string {
  switch (s.state) {
    case "unsupported":
      return "This browser can't save the app for offline use.";
    case "syncing":
      return `Saving lessons and quizzes to this device… ${s.done}/${s.total}`;
    case "ready":
      return `✓ All lessons and quizzes saved on this device (${s.pages} pages, ${new Date(s.savedAt).toLocaleDateString()}). The tutor chat needs internet.`;
    case "partial":
      return `Saved ${s.pages} pages; ${s.failed ?? 0} couldn't be downloaded. Try again when your connection is better.`;
    default:
      return online ? "Preparing offline copy…" : "Not saved for offline use yet — open the app once while online.";
  }
}

/** "Add to Home Screen" tip, shown until the app is installed or dismissed. */
export function InstallHint() {
  const standalone = useSyncExternalStore(
    noop,
    () => window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true,
    () => true
  );
  const isIos = useSyncExternalStore(noop, () => /iphone|ipad|ipod/i.test(navigator.userAgent), () => false);
  const [hideHint, setHideHint] = useState(true);

  useEffect(() => {
    try {
      setHideHint(localStorage.getItem("jagd-hide-install") === "1");
    } catch {
      setHideHint(false);
    }
  }, []);

  return (
    <>
    {!standalone && !hideHint && (
      <div className="card flex items-start gap-3 p-3 text-sm text-text">
        <span aria-hidden className="text-lg">📲</span>
        <p className="flex-1">
          <strong>Keep it on your phone:</strong>{" "}
          {isIos
            ? "in Safari tap the Share button, then “Add to Home Screen”."
            : "open the browser menu (⋮) and tap “Install app” or “Add to Home screen”."}{" "}
          Lessons and quizzes then work without internet.
        </p>
        <button
          aria-label="Hide"
          className="text-muted hover:text-text"
          onClick={() => {
            setHideHint(true);
            try {
              localStorage.setItem("jagd-hide-install", "1");
            } catch {}
          }}
        >
          ✕
        </button>
      </div>
    )}
    </>
  );
}
