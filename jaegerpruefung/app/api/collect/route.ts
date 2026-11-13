import { z } from "zod";
import { collectSection, type CollectorEvent } from "@/lib/agent/collector";
import { hasApiKey } from "@/lib/claude";

// An agent run does many searches and can take several minutes.
export const maxDuration = 800;

const bodySchema = z.object({
  sectionId: z.string().regex(/^[a-z0-9-]+$/),
  state: z.string().min(2).max(40),
  focus: z.string().max(300).optional(),
  maxLessons: z.number().int().min(1).max(6).optional(),
});

/** Runs the collector agent and streams its progress as newline-delimited JSON. */
export async function POST(req: Request) {
  if (process.env.ALLOW_WEB_COLLECTOR !== "true") {
    return Response.json({ error: "The web collector is disabled. Set ALLOW_WEB_COLLECTOR=true in .env.local, or run `npm run collect`." }, { status: 403 });
  }
  if (!hasApiKey()) {
    return Response.json({ error: "ANTHROPIC_API_KEY is not set in .env.local." }, { status: 503 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request" }, { status: 400 });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: CollectorEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      try {
        await collectSection({ ...parsed.data, onEvent: send, signal: req.signal });
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : String(err) });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(body, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store" } });
}
