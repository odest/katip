import { useCallback } from "react";
import { and, eq } from "drizzle-orm";
import {
  transcripts,
  type Transcript,
  type NewTranscript,
} from "@workspace/database/schema/sqlite";
import { database } from "@workspace/ui/db";

export function useTranscripts() {
  const addTranscript = useCallback(async (transcript: NewTranscript) => {
    try {
      await database.insert(transcripts).values(transcript);
      return { success: true };
    } catch (error) {
      console.error("Failed to add transcript:", error);
      return { success: false, error };
    }
  }, []);

  const getTranscriptByRecordingId = useCallback(
    async (
      recordingId: string,
      model: string,
      language: string
    ): Promise<Transcript | null> => {
      try {
        const result = await database.query.transcripts.findFirst({
          where: and(
            eq(transcripts.recordingId, recordingId),
            eq(transcripts.model, model),
            eq(transcripts.language, language)
          ),
        });

        return result || null;
      } catch (error) {
        console.error("Failed to get transcript by recording id:", error);
        return null;
      }
    },
    []
  );

  const deleteTranscriptByRecordingId = useCallback(
    async (recordingId: string, model: string, language: string) => {
      try {
        await database
          .delete(transcripts)
          .where(
            and(
              eq(transcripts.recordingId, recordingId),
              eq(transcripts.model, model),
              eq(transcripts.language, language)
            )
          );
        return { success: true };
      } catch (error) {
        console.error("Failed to delete transcript:", error);
        return { success: false, error };
      }
    },
    []
  );

  const getFirstTranscriptByRecordingId = useCallback(
    async (recordingId: string): Promise<Transcript | null> => {
      try {
        const result = await database.query.transcripts.findFirst({
          where: eq(transcripts.recordingId, recordingId),
        });

        return result || null;
      } catch (error) {
        console.error("Failed to get first transcript:", error);
        return null;
      }
    },
    []
  );

  const updateTranscriptSegments = useCallback(
    async (transcriptId: string, segments: Transcript["segments"]) => {
      try {
        await database
          .update(transcripts)
          .set({ segments })
          .where(eq(transcripts.id, transcriptId));
        return { success: true };
      } catch (error) {
        console.error("Failed to update transcript segments:", error);
        return { success: false, error };
      }
    },
    []
  );

  return {
    addTranscript,
    getTranscriptByRecordingId,
    getFirstTranscriptByRecordingId,
    deleteTranscriptByRecordingId,
    updateTranscriptSegments,
  };
}
