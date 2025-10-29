import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AudioState {
  selectedAudio: File | string | null;
  setSelectedAudio: (file: File | string | null) => void;
  clearAudioFile: () => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      selectedAudio: null,
      setSelectedAudio: (file) => set({ selectedAudio: file }),
      clearAudioFile: () => set({ selectedAudio: null }),
    }),
    {
      name: "audio-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedAudio:
          typeof state.selectedAudio === "string" ? state.selectedAudio : null,
      }),
    }
  )
);
