import { useCallback } from "react";
import { eq, desc, and, asc, like, isNull } from "drizzle-orm";
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
        const result = await database.query.recordings.findFirst({
          where: and(
            eq(recordings.fileHash, hash),
            eq(recordings.userId, userId),
            isNull(recordings.deletedAt)
          ),
        });

        return result || null;
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
        const result = await database.query.recordings.findFirst({
          where: and(
            eq(recordings.id, id),
            eq(recordings.userId, userId),
            isNull(recordings.deletedAt)
          ),
        });

        return result || null;
      } catch (error) {
        console.error("Failed to get recording by id:", error);
        return null;
      }
    },
    [userId]
  );

  const getPaginatedRecordings = useCallback(
    async (
      page: number,
      pageSize: number,
      searchQuery: string,
      sortBy: string
    ) => {
      if (!userId) return { recordings: [], totalCount: 0 };
      try {
        const offset = (page - 1) * pageSize;

        const conditions = [
          eq(recordings.userId, userId),
          isNull(recordings.deletedAt),
        ];

        if (searchQuery) {
          conditions.push(like(recordings.title, `%${searchQuery}%`));
        }
        const whereCondition = and(...conditions);

        let orderByCondition = desc(recordings.createdAt);
        if (sortBy) {
          switch (sortBy) {
            case "date_asc":
              orderByCondition = asc(recordings.createdAt);
              break;
            case "date_desc":
              orderByCondition = desc(recordings.createdAt);
              break;
            case "title_asc":
              orderByCondition = asc(recordings.title);
              break;
            case "title_desc":
              orderByCondition = desc(recordings.title);
              break;
            case "duration_asc":
              orderByCondition = asc(recordings.duration);
              break;
            case "duration_desc":
              orderByCondition = desc(recordings.duration);
              break;
            case "size_asc":
              orderByCondition = asc(recordings.fileSize);
              break;
            case "size_desc":
              orderByCondition = desc(recordings.fileSize);
              break;
            default:
              orderByCondition = desc(recordings.createdAt);
          }
        }

        const [data, allIds] = await Promise.all([
          database.query.recordings.findMany({
            where: whereCondition,
            orderBy: orderByCondition,
            limit: pageSize,
            offset: offset,
            columns: {
              id: true,
              title: true,
              filePath: true,
              duration: true,
              fileSize: true,
              status: true,
              isSynced: true,
              createdAt: true,
            },
          }),
          database
            .select({ id: recordings.id })
            .from(recordings)
            .where(whereCondition),
        ]);

        return {
          recordings: data as unknown as Recording[],
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
          .update(recordings)
          .set({
            deletedAt: new Date(),
            updatedAt: new Date(),
            isSynced: false,
          })
          .where(and(eq(recordings.id, id), eq(recordings.userId, userId)));
        return { success: true };
      } catch (error) {
        console.error("Failed to delete recording:", error);
        return { success: false, error };
      }
    },
    [userId]
  );

  const restoreRecording = useCallback(
    async (id: string) => {
      if (!userId) return { success: false, error: "No user ID" };
      try {
        await database
          .update(recordings)
          .set({ deletedAt: null, updatedAt: new Date(), isSynced: false })
          .where(and(eq(recordings.id, id), eq(recordings.userId, userId)));
        return { success: true };
      } catch (error) {
        console.error("Failed to restore recording:", error);
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
    restoreRecording,
  };
}
