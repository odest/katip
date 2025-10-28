import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ModelState {
  selectedModel: File | string | null;
  modelPath: string;
  setSelectedModel: (model: File | string | null) => void;
  setModelPath: (path: string) => void;
  clearModelFile: () => void;
}

export const useModelStore = create<ModelState>()(
  persist(
    (set) => ({
      selectedModel: null,
      modelPath: "",
      setSelectedModel: (model) => set({ selectedModel: model }),
      setModelPath: (path) => set({ modelPath: path }),
      clearModelFile: () => set({ selectedModel: null, modelPath: "" }),
    }),
    {
      name: "model-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        modelPath: state.modelPath,
        selectedModel:
          typeof state.selectedModel === "string" ? state.selectedModel : null,
      }),
    }
  )
);
