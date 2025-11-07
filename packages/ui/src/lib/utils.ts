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

type Segment = { start: number; end: number; text: string };
type TargetPlatform = "desktop" | "web";

export function formatSegmentsToText(
  segments: Segment[],
  targetPlatform: TargetPlatform
): string {
  return segments
    .map((s) => {
      if (targetPlatform === "desktop") {
        return `[${formatTimestamp(s.start / 100)}] --> [${formatTimestamp(
          s.end / 100
        )}]\n${s.text}`;
      } else {
        return `[${s.start}] --> [${s.end}]\n${s.text}`;
      }
    })
    .join("\n\n");
}
