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
        const result = await database
          .select()
          .from(transcripts)
          .where(
            and(
              eq(transcripts.recordingId, recordingId),
              eq(transcripts.model, model),
              eq(transcripts.language, language)
            )
          )
          .limit(1);

        return result[0] || null;
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

  return {
    addTranscript,
    getTranscriptByRecordingId,
    deleteTranscriptByRecordingId,
  };
}
