import { useEffect } from "react";
import { Moon, Palette, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { themeStore } from "@/lib/state";

export const ACCENTS = [
  { id: "pink", label: "Pink", hex: "#da6b71" },
  { id: "red", label: "Red", hex: "#d86258" },
  { id: "orange", label: "Orange", hex: "#e28d4f" },
  { id: "gold", label: "Gold", hex: "#d7b355" },
  { id: "green", label: "Green", hex: "#4ca871" },
  { id: "teal", label: "Teal", hex: "#41b2b2" },
  { id: "blue", label: "Blue", hex: "#4f8bd6" },
  { id: "violet", label: "Violet", hex: "#9773d0" },
] as const;

export function useThemeEffect() {
  const theme = themeStore.useStore((s) => s);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme["mode"] === "dark");
    root.dataset["accent"] = theme["accent"];
  }, [theme]);
}

export function ThemeControls() {
  const theme = themeStore.useStore((s) => s);
  return (
    <div className="flex items-center gap-1.5">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Change theme color">
            <Palette className="size-4.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Theme color
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                type="button"
                aria-label={`${a.label} theme`}
                title={a.label}
                onClick={() => themeStore.set({ accent: a.id })}
                className={cn(
                  "grid h-9 place-items-center rounded-lg border transition-transform hover:scale-105",
                  theme.accent === a.id ? "border-foreground/40" : "border-transparent",
                )}
              >
                <span
                  className={cn(
                    "size-5 rounded-full",
                    theme.accent === a.id && "ring-2 ring-offset-2 ring-offset-background",
                  )}
                  style={{ backgroundColor: a.hex, ...(theme.accent === a.id ? { boxShadow: `0 0 0 2px ${a.hex}` } : {}) }}
                />
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        size="icon"
        aria-label={theme.mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        onClick={() => themeStore.set({ mode: theme.mode === "dark" ? "light" : "dark" })}
      >
        {theme.mode === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
      </Button>
    </div>
  );
}
