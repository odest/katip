import { create } from "zustand";

interface ModelState {
  modelFile: File | null;
  modelPath: string;
  selectedModelName: string;
  setModelFile: (file: File | null) => void;
  setModelPath: (path: string) => void;
  setSelectedModelName: (name: string) => void;
  clearModel: () => void;
}

export const useModelStore = create<ModelState>((set) => ({
  modelFile: null,
  modelPath: "",
  selectedModelName: "",
  setModelFile: (file) => set({ modelFile: file }),
  setModelPath: (path) => set({ modelPath: path }),
  setSelectedModelName: (name) => set({ selectedModelName: name }),
  clearModel: () =>
    set({ modelFile: null, modelPath: "", selectedModelName: "" }),
}));
