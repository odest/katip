import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PerformanceState {
  useGPU: boolean;
  threadCount: number;
  setUseGPU: (useGPU: boolean) => void;
  setThreadCount: (threadCount: number) => void;
}

export const usePerformanceStore = create<PerformanceState>()(
  persist(
    (set) => ({
      useGPU: true,
      threadCount: 4,

      setUseGPU: (useGPU: boolean) => {
        set({ useGPU });
      },

      setThreadCount: (threadCount: number) => {
        set({ threadCount });
      },
    }),
    {
      name: "performance-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
