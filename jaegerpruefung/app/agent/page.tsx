import Link from "next/link";
import { connection } from "next/server";
import { listSections } from "@/lib/content/store";
import { hasApiKey } from "@/lib/claude";
import { AgentConsole } from "@/components/AgentConsole";

export default async function AgentPage(props: PageProps<"/agent">) {
  await connection();
  const sections = await listSections();
  const { section } = await props.searchParams;
  const enabled = process.env.ALLOW_WEB_COLLECTOR === "true";

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-muted hover:text-text">← All sections</Link>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Collector agent</h1>
        <p className="max-w-3xl text-muted">
          The agent searches the web for exam material for one section (laws, hunting associations, official bodies),
          reads the best pages, then writes new lessons in German with an English translation, plus quiz questions.
          Each lesson lists the pages it came from. A run takes a few minutes.
        </p>
      </div>
      {!hasApiKey() || !enabled ? (
        <div className="card space-y-2 p-5 text-sm">
          <p className="font-medium">The agent isn&apos;t enabled on this server yet.</p>
          <p className="text-muted">
            Add <code>ANTHROPIC_API_KEY</code> and <code>ALLOW_WEB_COLLECTOR=true</code> to <code>.env.local</code> and restart{" "}
            <code>npm run dev</code>. You can also run it from the terminal:{" "}
            <code>npm run collect -- --section wildtierkunde --state Bayern</code>
          </p>
        </div>
      ) : (
        <AgentConsole
          sections={sections.map((s) => ({ id: s.id, title: `${s.order}. ${s.titleDe}`, lessons: s.lessons.length }))}
          initialSection={typeof section === "string" ? section : undefined}
        />
      )}
    </div>
  );
}
