import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ModelState {
  selectedModel: File | string | null;
  useQuantized: boolean;
  setSelectedModel: (model: File | string | null) => void;
  setUseQuantized: (useQuantized: boolean) => void;
  clearModelFile: () => void;
}

export const useModelStore = create<ModelState>()(
  persist(
    (set) => ({
      selectedModel: null,
      useQuantized: true,
      setSelectedModel: (model) => set({ selectedModel: model }),
      setUseQuantized: (useQuantized) => set({ useQuantized }),
      clearModelFile: () => set({ selectedModel: null }),
    }),
    {
      name: "model-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        useQuantized: state.useQuantized,
        selectedModel:
          typeof state.selectedModel === "string" ? state.selectedModel : null,
      }),
    }
  )
);
