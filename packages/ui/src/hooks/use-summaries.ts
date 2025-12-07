import { useCallback } from "react";
import { eq } from "drizzle-orm";
import {
  summaries,
  type Summary,
  type NewSummary,
} from "@workspace/database/schema/sqlite";
import { database } from "@workspace/ui/db";

export function useSummaries() {
  const addSummary = useCallback(async (summary: NewSummary) => {
    try {
      await database.insert(summaries).values(summary);
      return summary;
    } catch (error) {
      console.error("Failed to add summary:", error);
      throw error;
    }
  }, []);

  const getSummaryByRecordingId = useCallback(
    async (recordingId: string): Promise<Summary | null> => {
      try {
        const result = await database.query.summaries.findFirst({
          where: eq(summaries.recordingId, recordingId),
        });

        return result || null;
      } catch (error) {
        console.error("Failed to get summary by recording id:", error);
        return null;
      }
    },
    []
  );

  const deleteSummaryByRecordingId = useCallback(
    async (recordingId: string) => {
      try {
        await database
          .delete(summaries)
          .where(eq(summaries.recordingId, recordingId));
        return { success: true };
      } catch (error) {
        console.error("Failed to delete summary:", error);
        return { success: false, error };
      }
    },
    []
  );

  return {
    addSummary,
    getSummaryByRecordingId,
    deleteSummaryByRecordingId,
  };
}
