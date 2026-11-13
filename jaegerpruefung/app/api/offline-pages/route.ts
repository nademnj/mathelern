import { promises as fs } from "node:fs";
import path from "node:path";
import { listSections } from "@/lib/content/store";

/**
 * Every page the service worker should keep on the device, plus a version
 * string that changes whenever the content changes, so the phone knows when
 * to download again.
 */
export async function GET() {
  const sections = await listSections();
  const pages = ["/", "/quiz/all"];
  const stamps: string[] = [];
  for (const s of sections) {
    pages.push(`/section/${s.id}`, `/quiz/${s.id}`);
    for (const l of s.lessons) {
      pages.push(`/section/${s.id}/${l.id}`);
      stamps.push(`${s.id}/${l.id}@${l.updatedAt}`);
    }
    stamps.push(`${s.id}#${s.quiz.length}:${s.quiz.map((q) => q.id).join(",").length}`);
  }
  // A new deploy changes the script files every page needs, so it must also
  // trigger a fresh download.
  const buildId = await fs.readFile(path.join(process.cwd(), ".next", "BUILD_ID"), "utf8").catch(() => "dev");
  const version = await sha1(`${buildId.trim()}|${stamps.join("|")}`);
  return Response.json({ version, pages }, { headers: { "Cache-Control": "no-store" } });
}

async function sha1(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 12);
}
