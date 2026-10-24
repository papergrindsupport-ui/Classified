import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LessonsProgress } from "@/components/LessonsProgress";
import { TrackTable } from "@/components/TrackTable";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track — Classified IGCSE Biology" },
      {
        name: "description",
        content:
          "Track your IGCSE Biology (0610) progress: lessons solved per topic and a 2016–2026 past-paper planner grid.",
      },
      { property: "og:title", content: "Track — Classified IGCSE Biology" },
      {
        property: "og:description",
        content:
          "Track your IGCSE Biology (0610) progress: lessons solved per topic and a 2016–2026 past-paper planner grid.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-8">
      <div>
        <div className="flex items-center gap-3">
          <Link
            to="/solve"
            aria-label="Back to Solve"
            title="Back to Solve"
            className="grid size-9 shrink-0 place-items-center rounded-full border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-tight">Track</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you check on the Solve page shows up here automatically, and it's all saved on
          this device.
        </p>
      </div>
      <LessonsProgress />
      <TrackTable />
    </div>
  );
}
