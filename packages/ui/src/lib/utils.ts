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

export async function getCachedModels(): Promise<Set<string>> {
  if (typeof window === "undefined" || !window.caches) {
    console.log("Cache Storage not supported.");
    return new Set();
  }

  try {
    const cacheNames = await window.caches.keys();
    const cacheName = cacheNames.find((name) =>
      name.startsWith("transformers-cache")
    );

    if (!cacheName) {
      console.log("Transformers cache not found.");
      return new Set();
    }

    const cache = await window.caches.open(cacheName);
    const keys = await cache.keys();
    const cachedUrls = new Set<string>();
    const modelIdRegex = /^\/([^/]+\/[^/]+)\//;

    for (const request of keys) {
      const pathname = new URL(request.url).pathname;
      const match = pathname.match(modelIdRegex);
      if (match && match[1]) {
        cachedUrls.add(match[1]);
      }
    }

    return cachedUrls;
  } catch (error) {
    console.error("Error accessing Cache Storage:", error);
    return new Set();
  }
}

export async function deleteCachedModel(modelId: string): Promise<boolean> {
  if (typeof window === "undefined" || !window.caches) {
    throw new Error("Cache Storage not supported.");
  }

  try {
    const cacheNames = await window.caches.keys();
    const cacheName = cacheNames.find((name) =>
      name.startsWith("transformers-cache")
    );

    if (!cacheName) {
      throw new Error("Transformers cache not found.");
    }

    const cache = await window.caches.open(cacheName);
    const keys = await cache.keys();
    let deleted = false;

    const modelIdPath = `/${modelId}/`;
    for (const request of keys) {
      if (new URL(request.url).pathname.includes(modelIdPath)) {
        await cache.delete(request);
        deleted = true;
      }
    }

    return deleted;
  } catch (error) {
    console.error("Error deleting model from cache:", error);
    throw error;
  }
}

export async function deleteAllCachedModels(): Promise<boolean> {
  if (typeof window === "undefined" || !window.caches) {
    throw new Error("Cache Storage not supported.");
  }

  try {
    const cacheNames = await window.caches.keys();
    const cacheName = cacheNames.find((name) =>
      name.startsWith("transformers-cache")
    );

    if (!cacheName) {
      return false;
    }

    const success = await window.caches.delete(cacheName);
    return success;
  } catch (error) {
    console.error("Error deleting all models from cache:", error);
    throw error;
  }
}

export const getBadgeStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case "synced":
    case "completed":
    case "connected":
      return "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/25";
    case "queued":
    case "low":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/25";
    case "cancelled":
    case "medium":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/25";
    case "failed":
    case "high":
    case "disconnected":
      return "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/25";
    case "processing":
    case "checking":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/25";
    case "unsynced":
    default:
      return "bg-background/10 text-primary border-border hover:bg-background/50";
  }
};

export async function calculateFileHash(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  } catch (error) {
    console.error("Error calculating file hash:", error);
    return "";
  }
}

export const getAudioDuration = (objectUrl: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(objectUrl);
      audio.onloadedmetadata = () => {
        const duration = audio.duration;

        URL.revokeObjectURL(objectUrl);

        if (duration === Infinity) {
          audio.currentTime = 1e101;
          audio.ontimeupdate = () => {
            audio.ontimeupdate = null;
            resolve(audio.duration);
          };
        } else {
          resolve(duration);
        }
      };

      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Error getting audio duration"));
      };
    } catch (error) {
      console.error("Error getting audio duration:", error);
      reject(error);
    }
  });
};

export async function fetchLatestGithubVersion(): Promise<string | null> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/odest/katip/releases/latest"
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.tag_name?.replace(/^v/, "") || null;
  } catch {
    return null;
  }
}
