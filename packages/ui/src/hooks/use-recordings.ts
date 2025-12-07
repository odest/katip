import { useCallback } from "react";
import { eq, desc, and } from "drizzle-orm";
import {
  recordings,
  type Recording,
  type NewRecording,
} from "@workspace/database/schema/sqlite";
import { database } from "@workspace/ui/db";
import { useAuthStore } from "@workspace/ui/stores/auth-store";

export function useRecordings() {
  const { userId } = useAuthStore();

  const addRecording = useCallback(
    async (recording: NewRecording) => {
      if (!userId) return { success: false, error: "No user ID" };
      try {
        await database.insert(recordings).values({ ...recording, userId });
        return { success: true };
      } catch (error) {
        console.error("Failed to add recording:", error);
        return { success: false, error };
      }
    },
    [userId]
  );

  const getRecordingByHash = useCallback(
    async (hash: string): Promise<Recording | null> => {
      if (!userId) return null;
      try {
        const result = await database
          .select()
          .from(recordings)
          .where(
            and(eq(recordings.fileHash, hash), eq(recordings.userId, userId))
          )
          .limit(1);

        return result[0] || null;
      } catch (error) {
        console.error("Failed to get recording by hash:", error);
        return null;
      }
    },
    [userId]
  );

  const getRecordingById = useCallback(
    async (id: string): Promise<Recording | null> => {
      if (!userId) return null;
      try {
        const result = await database
          .select()
          .from(recordings)
          .where(and(eq(recordings.id, id), eq(recordings.userId, userId)))
          .limit(1);

        return result[0] || null;
      } catch (error) {
        console.error("Failed to get recording by id:", error);
        return null;
      }
    },
    [userId]
  );

  const getPaginatedRecordings = useCallback(
    async (page: number, pageSize: number) => {
      if (!userId) return { recordings: [], totalCount: 0 };
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
              isSynced: recordings.isSynced,
              createdAt: recordings.createdAt,
            })
            .from(recordings)
            .where(eq(recordings.userId, userId))
            .orderBy(desc(recordings.createdAt))
            .limit(pageSize)
            .offset(offset),
          database
            .select({ id: recordings.id })
            .from(recordings)
            .where(eq(recordings.userId, userId)),
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
    [userId]
  );

  const deleteRecording = useCallback(
    async (id: string) => {
      if (!userId) return { success: false, error: "No user ID" };
      try {
        await database
          .delete(recordings)
          .where(and(eq(recordings.id, id), eq(recordings.userId, userId)));
        return { success: true };
      } catch (error) {
        console.error("Failed to delete recording:", error);
        return { success: false, error };
      }
    },
    [userId]
  );

  return {
    addRecording,
    getRecordingByHash,
    getRecordingById,
    getPaginatedRecordings,
    deleteRecording,
  };
}
