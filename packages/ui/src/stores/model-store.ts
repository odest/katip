import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ModelState {
  selectedModel: File | string | null;
  modelPath: string;
  useQuantized: boolean;
  setSelectedModel: (model: File | string | null) => void;
  setModelPath: (path: string) => void;
  setUseQuantized: (useQuantized: boolean) => void;
  clearModelFile: () => void;
}

export const useModelStore = create<ModelState>()(
  persist(
    (set) => ({
      selectedModel: null,
      modelPath: "",
      useQuantized: true,
      setSelectedModel: (model) => set({ selectedModel: model }),
      setModelPath: (path) => set({ modelPath: path }),
      setUseQuantized: (useQuantized) => set({ useQuantized }),
      clearModelFile: () => set({ selectedModel: null, modelPath: "" }),
    }),
    {
      name: "model-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        modelPath: state.modelPath,
        useQuantized: state.useQuantized,
        selectedModel:
          typeof state.selectedModel === "string" ? state.selectedModel : null,
      }),
    }
  )
);
