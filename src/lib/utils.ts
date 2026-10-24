import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Part labels are stored as letter + roman numerals ("ai", "biii") and are
 * displayed exactly as stored — no brackets.
 */
export function fmtPart(p: string) {
  return p;
}
