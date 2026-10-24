import type { MouseEvent } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tri = "on" | "off" | "ind";

export function BigCheckbox({
  state,
  onClick,
  label,
  className,
}: {
  state: Tri;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={state === "on" ? true : state === "ind" ? "mixed" : false}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-lg border transition-all",
        state === "off"
          ? "border-border bg-transparent hover:border-primary/70 hover:bg-primary/5"
          : "border-primary bg-primary text-primary-foreground",
        className,
      )}
    >
      {state === "on" && <Check className="size-4" strokeWidth={3} />}
      {state === "ind" && <Minus className="size-4" strokeWidth={3} />}
    </button>
  );
}
