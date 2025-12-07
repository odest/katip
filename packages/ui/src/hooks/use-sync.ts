import { useCallback } from "react";
import { eq } from "drizzle-orm";
import { database } from "@workspace/ui/db";
import {
  users,
  recordings,
  transcripts,
  summaries,
  actionItems,
} from "@workspace/database/schema/sqlite";

export function useSync() {
  const migrateGuestData = useCallback(
    async (
      guestId: string,
      authUser: {
        id: string;
        email: string;
        fullName: string;
        avatarUrl: string;
        createdAt: string;
        updatedAt: string;
      }
    ) => {
      try {
        await database
          .insert(users)
          .values({
            id: authUser.id,
            email: authUser.email,
            fullName: authUser.fullName,
            avatarUrl: authUser.avatarUrl,
            createdAt: new Date(authUser.createdAt),
            updatedAt: new Date(authUser.updatedAt),
          })
          .onConflictDoNothing({ target: users.id });

        await database
          .update(recordings)
          .set({ userId: authUser.id })
          .where(eq(recordings.userId, guestId));

        await database
          .update(transcripts)
          .set({ userId: authUser.id })
          .where(eq(transcripts.userId, guestId));

        await database
          .update(summaries)
          .set({ userId: authUser.id })
          .where(eq(summaries.userId, guestId));

        await database
          .update(actionItems)
          .set({ userId: authUser.id })
          .where(eq(actionItems.userId, guestId));

        await database.delete(users).where(eq(users.id, guestId));

        return { success: true };
      } catch (error) {
        console.error("Migration failed:", error);
        return { success: false, error };
      }
    },
    []
  );

  return {
    migrateGuestData,
  };
}
