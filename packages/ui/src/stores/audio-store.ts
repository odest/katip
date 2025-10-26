import { create } from "zustand";

interface AudioState {
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  clearAudioFile: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  audioFile: null,
  setAudioFile: (file) => set({ audioFile: file }),
  clearAudioFile: () => set({ audioFile: null }),
}));
