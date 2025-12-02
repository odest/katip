import { useCallback } from "react";
import { eq } from "drizzle-orm";
import {
  recordings,
  type Recording,
  type NewRecording,
} from "@workspace/database/schema/sqlite";
import { database } from "@workspace/ui/db";

export function useRecordings() {
  const addRecording = useCallback(async (recording: NewRecording) => {
    try {
      await database.insert(recordings).values(recording);
      return { success: true };
    } catch (error) {
      console.error("Failed to add recording:", error);
      return { success: false, error };
    }
  }, []);

  const getRecordingByHash = useCallback(
    async (hash: string): Promise<Recording | null> => {
      try {
        const result = await database
          .select()
          .from(recordings)
          .where(eq(recordings.fileHash, hash))
          .limit(1);

        return result[0] || null;
      } catch (error) {
        console.error("Failed to get recording by hash:", error);
        return null;
      }
    },
    []
  );

  return {
    addRecording,
    getRecordingByHash,
  };
}
