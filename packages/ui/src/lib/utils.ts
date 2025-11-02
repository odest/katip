import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(seconds: number): string {
  if (isNaN(seconds)) {
    return "00:00";
  }

  const totalSeconds = Math.round(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function formatSegmentsToText(
  segments: Array<{ start: number; end: number; text: string }>
): string {
  return segments
    .map(
      (s) =>
        `[${formatTimestamp(s.start / 100)}] --> [${formatTimestamp(s.end / 100)}]\n${s.text}`
    )
    .join("\n\n");
}
