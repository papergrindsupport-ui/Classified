import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { TutorialModal } from "@/components/TutorialModal";
import { playSound } from "@/lib/sounds";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Classified — Start Solving IGCSE Biology" },
      {
        name: "description",
        content:
          "Hi Lara! Solve classified Cambridge IGCSE Biology (0610) past-paper questions by topic, lesson and year — and track your progress.",
      },
      {
        property: "og:title",
        content: "Classified — Start Solving IGCSE Biology",
      },
      {
        property: "og:description",
        content:
          "Solve classified Cambridge IGCSE Biology (0610) past-paper questions by topic, lesson and year.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const headingParts = ["Hi ", "Lara", ", start solving ", "classified", " ", "احسن لك!"];
  const heading = headingParts.join("");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisibleCharacters(Array.from(heading).length);
      return;
    }

    const interval = window.setInterval(() => {
      setVisibleCharacters((current) => {
        if (current >= Array.from(heading).length) {
          window.clearInterval(interval);
          return current;
        }
        return current + 1;
      });
    }, 45);

    return () => window.clearInterval(interval);
  }, [heading]);

  let remainingCharacters = visibleCharacters;
  const visibleText = headingParts.map((part) => {
    const characters = Array.from(part);
    const visiblePart = characters.slice(0, remainingCharacters).join("");
    remainingCharacters = Math.max(0, remainingCharacters - characters.length);
    return visiblePart;
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:py-36">
      <h1
        aria-label={heading}
        className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
      >
        <span aria-hidden="true">{visibleText[0]}</span>
        <span aria-hidden="true" className="text-primary">
          {visibleText[1]}
        </span>
        <span aria-hidden="true">{visibleText[2]}</span>
        <span aria-hidden="true" className="text-primary">
          {visibleText[3]}
        </span>
        <span aria-hidden="true">{visibleText[4]}</span>
        <span aria-hidden="true" className="font-arabic text-primary">
          {visibleText[5]}
        </span>
      </h1>
      <p className="mt-5 text-sm text-muted-foreground">Chemistry coming soon</p>
      <Link
        to="/solve"
        onClick={() => playSound("click")}
        className="mt-12 inline-flex h-16 items-center gap-3 rounded-2xl bg-primary px-12 text-xl font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98]"
      >
        Start solving
        <ArrowRight className="size-6" />
      </Link>
      <TutorialModal />
    </div>
  );
}
