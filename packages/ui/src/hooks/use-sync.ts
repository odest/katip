import { useCallback } from "react";
import { eq, and } from "drizzle-orm";
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
        deleted_at:
          localRec.deletedAt && localRec.deletedAt.getTime() > 0
            ? localRec.deletedAt.toISOString()
            : null,
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

  const pullRecordings = useCallback(async () => {
    const { userId } = useAuthStore.getState();
    if (!userId) return { success: false, error: "No user ID" };

    try {
      const { data: remoteData, error: fetchError } = await supabase
        .from("recordings")
        .select(
          `
          *,
          transcripts (*),
          summaries (*),
          action_items (*)
        `
        )
        .eq("user_id", userId);

      if (fetchError) throw fetchError;
      if (!remoteData) return { success: true };

      for (const rec of remoteData) {
        await database
          .insert(recordings)
          .values({
            id: rec.id,
            userId: rec.user_id,
            title: rec.title,
            description: rec.description,
            filePath: rec.file_path,
            fileHash: rec.file_hash,
            duration: rec.duration,
            fileSize: rec.file_size,
            status: rec.status,
            isFavorite: rec.is_favorite,
            tags: rec.tags,
            isSynced: true,
            createdAt: new Date(rec.created_at),
            updatedAt: new Date(rec.updated_at),
            deletedAt: rec.deleted_at ? new Date(rec.deleted_at) : null,
          })
          .onConflictDoUpdate({
            target: recordings.id,
            set: {
              title: rec.title,
              description: rec.description,
              filePath: rec.file_path,
              status: rec.status,
              isFavorite: rec.is_favorite,
              tags: rec.tags,
              isSynced: true,
              updatedAt: new Date(rec.updated_at),
              deletedAt: rec.deleted_at ? new Date(rec.deleted_at) : null,
            },
          });

        if (rec.transcripts && rec.transcripts.length > 0) {
          for (const tr of rec.transcripts) {
            await database
              .insert(transcripts)
              .values({
                id: tr.id,
                recordingId: tr.recording_id,
                userId: tr.user_id,
                language: tr.language,
                model: tr.model,
                segments: tr.segments,
                createdAt: new Date(tr.created_at),
              })
              .onConflictDoNothing();
          }
        }

        if (rec.summaries && rec.summaries.length > 0) {
          for (const sum of rec.summaries) {
            await database
              .insert(summaries)
              .values({
                id: sum.id,
                transcriptId: sum.transcript_id,
                recordingId: sum.recording_id,
                userId: sum.user_id,
                content: sum.content,
                provider: sum.provider,
                model: sum.model,
                createdAt: new Date(sum.created_at),
              })
              .onConflictDoNothing();
          }
        }

        if (rec.action_items && rec.action_items.length > 0) {
          for (const ai of rec.action_items) {
            await database
              .insert(actionItems)
              .values({
                id: ai.id,
                summaryId: ai.summary_id,
                recordingId: ai.recording_id,
                userId: ai.user_id,
                task: ai.task,
                assignee: ai.assignee,
                isCompleted: ai.is_completed,
                priority: ai.priority,
                createdAt: new Date(ai.created_at),
              })
              .onConflictDoUpdate({
                target: actionItems.id,
                set: {
                  isCompleted: ai.is_completed,
                  assignee: ai.assignee,
                  priority: ai.priority,
                },
              });
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Pull recordings failed:", error);
      return { success: false, error };
    }
  }, []);

  const pushRecordings = useCallback(async () => {
    const { userId } = useAuthStore.getState();
    if (!userId) return { success: false, error: "No user ID" };

    try {
      const unsyncedRecordings = await database.query.recordings.findMany({
        where: and(
          eq(recordings.userId, userId),
          eq(recordings.isSynced, false)
        ),
      });

      if (unsyncedRecordings.length === 0) {
        return { success: true, pushedCount: 0 };
      }

      let successCount = 0;
      let failCount = 0;

      for (const rec of unsyncedRecordings) {
        const result = await pushRecording(rec.id);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          console.error(`Failed to push recording ${rec.id}:`, result.error);
        }
      }

      return {
        success: failCount === 0,
        pushedCount: successCount,
        failCount,
      };
    } catch (error) {
      console.error("Push local recordings failed:", error);
      return { success: false, error };
    }
  }, [pushRecording]);

  const syncAll = useCallback(async () => {
    const pushResult = await pushRecordings();
    const pullResult = await pullRecordings();

    const success =
      (pushResult.success || pushResult.pushedCount === 0) &&
      pullResult.success;

    return {
      success,
      pushResult,
      pullResult,
    };
  }, [pushRecordings, pullRecordings]);

  return {
    migrateGuestData,
    pushRecording,
    pullRecordings,
    pushRecordings,
    syncAll,
  };
}
