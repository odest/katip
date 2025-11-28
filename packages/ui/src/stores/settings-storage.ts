import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type SettingsTabs = "general" | "models" | "account";

interface SettingsState {
  selectedTab: SettingsTabs;
  setSelectedTab: (tab: SettingsTabs) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      selectedTab: "general",
      setSelectedTab: (tab) => set({ selectedTab: tab }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
