import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Dna, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playSound } from "@/lib/sounds";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Classified — Solve IGCSE Biology & Chemistry" },
      {
        name: "description",
        content:
          "Solve classified Cambridge IGCSE Biology (0610) and Chemistry (0620) questions by topic, lesson and year, and track your progress.",
      },
      {
        property: "og:title",
        content: "Classified — Solve IGCSE Biology & Chemistry",
      },
      {
        property: "og:description",
        content:
          "Solve classified Cambridge IGCSE Biology and Chemistry past-paper questions and track your progress.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const headingParts = ["Hi ", "Lara", ", start solving ", "classified", " ", "حالاااا!"];
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
      <div className="mt-12 flex w-full flex-wrap justify-center gap-4">
        <Button asChild className="h-16 gap-3 rounded-2xl px-8 text-xl font-bold shadow-lg">
          <Link to="/solve" onClick={() => playSound("click")}>
            <Dna className="size-6" />
            Start solving
            <ArrowRight className="size-6" />
          </Link>
        </Button>
        <Button
          asChild
          className="subject-chem h-16 gap-3 rounded-2xl px-8 text-xl font-bold shadow-lg"
        >
          <Link to="/solve-chem" onClick={() => playSound("click")}>
            <FlaskConical className="size-6" />
            Solve chem
            <ArrowRight className="size-6" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
