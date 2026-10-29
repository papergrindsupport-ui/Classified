import { createFileRoute } from "@tanstack/react-router";
import { SolvePage } from "@/components/SolvePage";
import { SubjectProvider } from "@/lib/subjectContext";
import { biology } from "@/lib/state";

export const Route = createFileRoute("/solve")({
  validateSearch: (search: Record<string, unknown>) => {
    // ?lesson=<name> deep-links from Track / lesson badges to a single lesson
    // with every year selected. ?topic=<name> does the same for every lesson
    // of that topic. Keys are only present when set, so plain links to /solve
    // stay valid.
    const lesson =
      typeof search["lesson"] === "string" && search["lesson"] ? search["lesson"] : undefined;
    const topic =
      typeof search["topic"] === "string" && search["topic"] ? search["topic"] : undefined;
    return {
      ...(lesson ? { lesson } : {}),
      ...(topic ? { topic } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Solve — Classified IGCSE Biology" },
      {
        name: "description",
        content:
          "Browse Cambridge IGCSE Biology (0610) past-paper questions by topic, lesson and year. Open the paper or mark scheme and tick parts off as you solve.",
      },
      { property: "og:title", content: "Solve — Classified IGCSE Biology" },
      {
        property: "og:description",
        content:
          "Browse Cambridge IGCSE Biology (0610) past-paper questions by topic, lesson and year.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BioSolveRoute,
});

function BioSolveRoute() {
  const { lesson, topic } = Route.useSearch();
  return (
    <SubjectProvider subject={biology}>
      <SolvePage lesson={lesson} topic={topic} />
    </SubjectProvider>
  );
}
