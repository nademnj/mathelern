"use client";

// Thin wrapper around the Web Speech API (free, no API key) -- used both for
// the chat tutor's spoken answers and for lessons narrating themselves aloud.
export function speakGerman(text: string) {
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
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
