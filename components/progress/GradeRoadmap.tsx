import Link from "next/link";
import type { TopicMasteryStatus } from "@/lib/types/db";
import { MasteryBar } from "./MasteryBar";

export interface RoadmapTopic {
  slug: string;
  title: string;
  status: TopicMasteryStatus;
  masteryScore: number;
}

export function GradeRoadmap({ topics }: { topics: RoadmapTopic[] }) {
  if (topics.length === 0) {
    return <p className="text-sm text-muted-foreground">Noch keine Themen veröffentlicht.</p>;
  }

  return (
    <ol className="space-y-3">
      {topics.map((topic) => (
        <li key={topic.slug}>
          <Link href={`/topic/${topic.slug}`} className="block rounded-md border p-3 hover:bg-muted">
            <MasteryBar title={topic.title} status={topic.status} masteryScore={topic.masteryScore} />
          </Link>
        </li>
      ))}
    </ol>
  );
}
