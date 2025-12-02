import { useCallback } from "react";
import { eq } from "drizzle-orm";
import {
  actionItems,
  type ActionItem,
  type NewActionItem,
} from "@workspace/database/schema/sqlite";
import { database } from "@workspace/ui/db";

export function useActionItems() {
  const addActionItems = useCallback(async (items: NewActionItem[]) => {
    try {
      if (items.length === 0) return;
      await database.insert(actionItems).values(items);
      return items;
    } catch (error) {
      console.error("Failed to add action items:", error);
      throw error;
    }
  }, []);

  const getActionItemsBySummaryId = useCallback(
    async (summaryId: string): Promise<ActionItem[]> => {
      try {
        const result = await database
          .select()
          .from(actionItems)
          .where(eq(actionItems.summaryId, summaryId));

        return result;
      } catch (error) {
        console.error("Failed to get action items by summary id:", error);
        return [];
      }
    },
    []
  );

  return {
    addActionItems,
    getActionItemsBySummaryId,
  };
}
