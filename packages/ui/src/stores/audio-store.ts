import { create } from "zustand";

interface AudioState {
  selectedAudio: File | string | null;
  setSelectedAudio: (file: File | string | null) => void;
  clearAudioFile: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  selectedAudio: null,
  setSelectedAudio: (file) => set({ selectedAudio: file }),
  clearAudioFile: () => set({ selectedAudio: null }),
}));
