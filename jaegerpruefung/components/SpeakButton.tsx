"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Reads German text aloud with the browser's built-in speech synthesis. */
export function SpeakButton({ text }: { text: string }) {
  const supported = useSyncExternalStore(subscribe, () => "speechSynthesis" in window, () => false);
  if (!supported) return null;
  const speak = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = 0.9;
    const voice = synth.getVoices().find((v) => v.lang.startsWith("de"));
    if (voice) u.voice = voice;
    synth.speak(u);
  };
  return (
    <button className="text-muted hover:text-text" onClick={speak} title="Listen to the German text">
      🔊 Listen
    </button>
  );
}
