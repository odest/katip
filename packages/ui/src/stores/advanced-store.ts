import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SamplingStrategy = "greedy" | "beamSearch";

interface AdvancedState {
  strategy: SamplingStrategy;
  bestOf: number;
  beamSize: number;
  temperature: number;
  initialPrompt: string;
  suppressNonSpeechTokens: boolean;
  patience: number;
  lengthPenalty: number;
  suppressBlank: boolean;
  tokenTimestamps: boolean;
  gpuDevice: number;
  maxLength: number;
  splitOnWord: boolean;
  setStrategy: (strategy: SamplingStrategy) => void;
  setBestOf: (bestOf: number) => void;
  setBeamSize: (beamSize: number) => void;
  setTemperature: (temperature: number) => void;
  setInitialPrompt: (initialPrompt: string) => void;
  setSuppressNonSpeechTokens: (suppressNonSpeechTokens: boolean) => void;
  setPatience: (patience: number) => void;
  setLengthPenalty: (lengthPenalty: number) => void;
  setSuppressBlank: (suppressBlank: boolean) => void;
  setTokenTimestamps: (tokenTimestamps: boolean) => void;
  setGpuDevice: (gpuDevice: number) => void;
  setMaxLength: (maxLength: number) => void;
  setSplitOnWord: (splitOnWord: boolean) => void;
}

export const useAdvancedStore = create<AdvancedState>()(
  persist(
    (set) => ({
      strategy: "greedy",
      bestOf: 1,
      beamSize: 5,
      temperature: 0,
      initialPrompt: "",
      suppressNonSpeechTokens: false,
      patience: 1.0,
      lengthPenalty: 1.0,
      suppressBlank: true,
      tokenTimestamps: false,
      gpuDevice: 0,
      maxLength: 0,
      splitOnWord: false,
      setStrategy: (strategy) => set({ strategy }),
      setBestOf: (bestOf) => set({ bestOf }),
      setBeamSize: (beamSize) => set({ beamSize }),
      setTemperature: (temperature) => set({ temperature }),
      setInitialPrompt: (initialPrompt) => set({ initialPrompt }),
      setSuppressNonSpeechTokens: (suppressNonSpeechTokens) =>
        set({ suppressNonSpeechTokens }),
      setPatience: (patience) => set({ patience }),
      setLengthPenalty: (lengthPenalty) => set({ lengthPenalty }),
      setSuppressBlank: (suppressBlank) => set({ suppressBlank }),
      setTokenTimestamps: (tokenTimestamps) => set({ tokenTimestamps }),
      setGpuDevice: (gpuDevice) => set({ gpuDevice }),
      setMaxLength: (maxLength) => set({ maxLength }),
      setSplitOnWord: (splitOnWord) => set({ splitOnWord }),
    }),
    {
      name: "advanced-settings",
    }
  )
);
