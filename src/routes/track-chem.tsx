import { createFileRoute } from "@tanstack/react-router";
import { TrackPage } from "@/components/TrackPage";
import { SubjectProvider } from "@/lib/subjectContext";
import { chemistry } from "@/lib/chemState";

export const Route = createFileRoute("/track-chem")({
  head: () => ({
    meta: [
      { title: "Track — Classified IGCSE Chemistry" },
      {
        name: "description",
        content:
          "Track your IGCSE Chemistry (0620) progress: lessons solved per topic and a 2016–2026 past-paper planner grid.",
      },
      { property: "og:title", content: "Track — Classified IGCSE Chemistry" },
      {
        property: "og:description",
        content:
          "Track your IGCSE Chemistry (0620) progress: lessons solved per topic and a 2016–2026 past-paper planner grid.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChemTrackRoute,
});

function ChemTrackRoute() {
  return (
    <SubjectProvider subject={chemistry}>
      <TrackPage />
    </SubjectProvider>
  );
}
