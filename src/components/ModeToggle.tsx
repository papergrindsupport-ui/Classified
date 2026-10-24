import { LayoutGrid, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { viewStore } from "@/lib/prefs";
import { playSound } from "@/lib/sounds";

/** Round fixed button, bottom-right: switches Solve between grid and play mode. */
export function ModeToggle() {
  const mode = viewStore.useStore((s) => s.mode);
  const inPlay = mode === "play";
  return (
    <Button
      size="icon"
      aria-label={inPlay ? "Switch to grid mode" : "Switch to play mode"}
      title={
        inPlay
          ? "Switch to grid mode (all cards)"
          : "Switch to play mode (one card at a time)"
      }
      onClick={() => {
        playSound("click");
        viewStore.set({ mode: inPlay ? "grid" : "play" });
      }}
      className="fixed bottom-5 right-5 z-40 size-12 rounded-full border bg-card text-foreground shadow-lg hover:bg-accent"
    >
      {inPlay ? (
        <LayoutGrid className="size-5" />
      ) : (
        <Play className="size-5 fill-current" />
      )}
    </Button>
  );
}
