import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SummaryResult } from "@workspace/ui/lib/ai-client";

interface SummaryState {
  isSummarizing: boolean;
  showSideViews: boolean;
  summaryResult: SummaryResult | null;
  error: string | null;
  provider: string;
  model: string;
  url: string;
  apiKey: string;
  setSummarizing: (isSummarizing: boolean) => void;
  setShowSideViews: (show: boolean) => void;
  setSummaryResult: (result: SummaryResult | null) => void;
  setError: (error: string | null) => void;
  toggleActionItem: (index: number) => void;
  setSettings: (settings: {
    provider: string;
    model: string;
    url: string;
    apiKey: string;
  }) => void;
  resetSummary: () => void;
}

export const useSummaryStore = create<SummaryState>()(
  persist(
    (set) => ({
      isSummarizing: false,
      showSideViews: false,
      summaryResult: null,
      error: null,
      provider: "ollama",
      model: "",
      url: "http://localhost:11434",
      apiKey: "",
      setSummarizing: (isSummarizing) => set({ isSummarizing }),
      setShowSideViews: (show) => set({ showSideViews: show }),
      setSummaryResult: (result) => set({ summaryResult: result }),
      setError: (error) => set({ error }),
      setSettings: (settings) => set(settings),
      resetSummary: () =>
        set({
          isSummarizing: false,
          showSideViews: false,
          summaryResult: null,
          error: null,
        }),
      toggleActionItem: (index) =>
        set((state) => {
          if (!state.summaryResult) return state;
          const newActionItems = [...state.summaryResult.action_items];
          const item = newActionItems[index];
          if (item) {
            newActionItems[index] = {
              ...item,
              completed: !item.completed,
            };
          }
          return {
            summaryResult: {
              ...state.summaryResult,
              action_items: newActionItems,
            },
          };
        }),
    }),
    {
      name: "summary-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        summaryResult: state.summaryResult,
        showSideViews: state.showSideViews,
        provider: state.provider,
        model: state.model,
        url: state.url,
        apiKey: state.apiKey,
      }),
    }
  )
);
