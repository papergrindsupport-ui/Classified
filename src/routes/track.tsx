import { createFileRoute } from "@tanstack/react-router";
import { TrackPage } from "@/components/TrackPage";
import { SubjectProvider } from "@/lib/subjectContext";
import { biology } from "@/lib/state";

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
  component: BioTrackRoute,
});

function BioTrackRoute() {
  return (
    <SubjectProvider subject={biology}>
      <TrackPage />
    </SubjectProvider>
  );
}
