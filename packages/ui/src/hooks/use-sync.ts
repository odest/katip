import { useCallback } from "react";
import { eq } from "drizzle-orm";
import { database } from "@workspace/ui/db";
import { createClient } from "@workspace/ui/lib/supabase";
import { useAuthStore } from "@workspace/ui/stores/auth-store";
import {
  users,
  recordings,
  transcripts,
  summaries,
  actionItems,
  type Transcript,
  type Summary,
  type ActionItem,
} from "@workspace/database/schema/sqlite";

const supabase = createClient();

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

  const pushRecording = useCallback(async (recordingId: string) => {
    const { userId } = useAuthStore.getState();
    if (!userId) return { success: false, error: "No user ID" };

    try {
      const localRec = await database.query.recordings.findFirst({
        where: eq(recordings.id, recordingId),
        with: {
          transcripts: true,
          summaries: true,
          actionItems: true,
        },
      });

      if (!localRec) {
        throw new Error("Recording not found locally");
      }

      const { error: recError } = await supabase.from("recordings").upsert({
        id: localRec.id,
        user_id: userId,
        title: localRec.title,
        description: localRec.description,
        file_path: localRec.filePath,
        file_hash: localRec.fileHash,
        duration: localRec.duration,
        file_size: localRec.fileSize,
        status: localRec.status,
        is_favorite: localRec.isFavorite,
        tags: localRec.tags,
        is_synced: true,
        created_at: localRec.createdAt?.toISOString(),
        updated_at: localRec.updatedAt?.toISOString(),
        deleted_at: localRec.deletedAt?.toISOString(),
      });

      if (recError) throw recError;

      if (localRec.transcripts.length > 0) {
        const { error: trError } = await supabase.from("transcripts").upsert(
          localRec.transcripts.map((t: Transcript) => ({
            id: t.id,
            recording_id: t.recordingId,
            user_id: userId,
            language: t.language,
            model: t.model,
            segments: t.segments,
            created_at: t.createdAt?.toISOString(),
          }))
        );
        if (trError) throw trError;
      }

      if (localRec.summaries.length > 0) {
        const { error: sumError } = await supabase.from("summaries").upsert(
          localRec.summaries.map((s: Summary) => ({
            id: s.id,
            transcript_id: s.transcriptId,
            recording_id: s.recordingId,
            user_id: userId,
            content: s.content,
            provider: s.provider,
            model: s.model,
            created_at: s.createdAt?.toISOString(),
          }))
        );
        if (sumError) throw sumError;
      }

      if (localRec.actionItems.length > 0) {
        const { error: aiError } = await supabase.from("action_items").upsert(
          localRec.actionItems.map((a: ActionItem) => ({
            id: a.id,
            summary_id: a.summaryId,
            recording_id: a.recordingId,
            user_id: userId,
            task: a.task,
            assignee: a.assignee,
            is_completed: a.isCompleted,
            priority: a.priority,
            created_at: a.createdAt?.toISOString(),
          }))
        );
        if (aiError) throw aiError;
      }

      await database
        .update(recordings)
        .set({ isSynced: true })
        .where(eq(recordings.id, recordingId));

      return { success: true };
    } catch (error) {
      console.error("Push recording failed:", error);
      return { success: false, error };
    }
  }, []);

  return {
    migrateGuestData,
    pushRecording,
  };
}
