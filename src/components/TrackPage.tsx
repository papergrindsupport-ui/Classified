import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LessonsProgress } from "@/components/LessonsProgress";
import { TrackTable } from "@/components/TrackTable";
import { useSubject } from "@/lib/subjectContext";

/** The Track page body, shared by Biology (/track) and Chemistry (/track-chem). */
export function TrackPage() {
  const S = useSubject();
  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-8">
      <div>
        <div className="flex items-center gap-3">
          <Link
            to={S.solvePath}
            aria-label="Back to Solve"
            title="Back to Solve"
            className="grid size-9 shrink-0 place-items-center rounded-full border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-tight">Track {S.name}</h1>
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
