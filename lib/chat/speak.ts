"use client";

// Thin wrapper around the Web Speech API (free, no API key) -- used both for
// the chat tutor's spoken answers and for lessons narrating themselves aloud.
//
// The default voice `speechSynthesis` picks is whatever the OS lists first,
// which on Windows is usually a robotic SAPI voice. Browsers also expose
// much better cloud/neural voices (e.g. Chrome's "Google Deutsch") in the
// same voice list -- we just have to ask for one by name instead of taking
// voices[0]. Voices also load asynchronously on first page load, so we wait
// for them once per session instead of racing `getVoices()`.

let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (voicesReady) return voicesReady;
  voicesReady = new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    const handleChange = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handleChange);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", handleChange);
    // Some engines never fire voiceschanged -- don't hang forever.
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 500);
  });
  return voicesReady;
}

function pickBestGermanVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const german = voices.filter((v) => v.lang?.toLowerCase().startsWith("de"));
  const pool = german.length > 0 ? german : voices;
  if (pool.length === 0) return null;

  return (
    // Chrome/Edge's cloud voices ("Google Deutsch", "Microsoft Katja Online
    // (Natural)") sound dramatically more fluid than the default local ones.
    pool.find((v) => /google/i.test(v.name)) ??
    pool.find((v) => /online.*natural|natural.*online/i.test(v.name)) ??
    pool.find((v) => /natural|neural/i.test(v.name)) ??
    // Falling back to a local-only OS voice list (no cloud voice installed):
    // of the handful of classic German SAPI voices, "Katja" reads as the
    // least robotic -- worth naming explicitly rather than taking
    // whichever voice happens to be listed first.
    pool.find((v) => /katja/i.test(v.name)) ??
    pool.find((v) => v.lang?.toLowerCase() === "de-de") ??
    pool[0]
  );
}

export async function speakGerman(text: string) {
  try {
    window.speechSynthesis.cancel();
    const voices = await loadVoices();
    const voice = pickBestGermanVoice(voices);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    // Slightly slower than default reads as more deliberate/natural rather
    // than rushed, and gives students with focus difficulties more time.
    utterance.rate = 0.95;
    utterance.pitch = 1;
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  } catch {
    // Web Speech API unavailable (unsupported browser) -- fail silently, text is still shown.
  }
}

export function stopSpeaking() {
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}
