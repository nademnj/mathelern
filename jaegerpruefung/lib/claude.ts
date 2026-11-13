import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-opus-5-5";

/**
 * Server-side refusal fallback: if the model declines a request, the API
 * re-runs it on a fallback model inside the same call.
 */
export const FALLBACK_BETA = "server-side-fallback-2026-07-01" as const;

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set. Copy .env.local.example to .env.local and add a key.");
  return new Anthropic({ apiKey });
}
