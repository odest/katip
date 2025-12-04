import { useCallback } from "react";
import { eq, desc } from "drizzle-orm";
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

  const getPaginatedRecordings = useCallback(
    async (page: number, pageSize: number) => {
      try {
        const offset = (page - 1) * pageSize;

        const [data, allIds] = await Promise.all([
          database
            .select({
              id: recordings.id,
              title: recordings.title,
              filePath: recordings.filePath,
              duration: recordings.duration,
              fileSize: recordings.fileSize,
              status: recordings.status,
              createdAt: recordings.createdAt,
            })
            .from(recordings)
            .orderBy(desc(recordings.createdAt))
            .limit(pageSize)
            .offset(offset),
          database.select({ id: recordings.id }).from(recordings),
        ]);

        return {
          recordings: data,
          totalCount: allIds.length,
        };
      } catch (error) {
        console.error("Failed to get paginated recordings:", error);
        return { recordings: [], totalCount: 0 };
      }
    },
    []
  );

  return {
    addRecording,
    getRecordingByHash,
    getPaginatedRecordings,
  };
}
