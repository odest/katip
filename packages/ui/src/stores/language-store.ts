import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface LanguageState {
  language: string;
  translateToEnglish: boolean;
  setLanguage: (language: string) => void;
  setTranslateToEnglish: (translateToEnglish: boolean) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "auto",
      translateToEnglish: false,

      setLanguage: (language: string) => {
        set({ language });
      },

      setTranslateToEnglish: (translateToEnglish: boolean) => {
        set({ translateToEnglish });
      },
    }),
    {
      name: "language-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
