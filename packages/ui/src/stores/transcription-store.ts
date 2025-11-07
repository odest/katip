import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Segment {
  start: number;
  end: number;
  text: string;
}

export type TranscriptionStatus =
  | "loadingModel"
  | "transcribing"
  | "cancelled"
  | "done"
  | "error";

export interface TranscriptionState {
  file: string | null;
  model: string | null;
  status: TranscriptionStatus;
  progress: number;
  segments: Segment[];
  error: string | null;
}

interface TranscriptionStore extends TranscriptionState {
  setTranscriptionState: (state: TranscriptionState) => void;
  getTranscriptionState: () => TranscriptionState | null;
  clearTranscriptionState: () => void;
  checkTranscriptionMatch: (
    file: string,
    model: string
  ) => TranscriptionState | null;
}

export const useTranscriptionStore = create(
  persist<TranscriptionStore>(
    (set, get) => ({
      file: null,
      model: null,
      status: "loadingModel" as TranscriptionStatus,
      progress: 0,
      segments: [],
      error: null,

      setTranscriptionState: (state) =>
        set({
          file: state.file,
          model: state.model,
          status: state.status,
          progress: state.progress,
          segments: state.segments,
          error: state.error,
        }),

      getTranscriptionState: () => {
        const state = get();
        if (!state.file) return null;

        return {
          file: state.file,
          model: state.model,
          status: state.status,
          progress: state.progress,
          segments: state.segments,
          error: state.error,
        };
      },

      clearTranscriptionState: () =>
        set({
          file: null,
          model: null,
          status: "loadingModel" as TranscriptionStatus,
          progress: 0,
          segments: [],
          error: null,
        }),

      checkTranscriptionMatch: (file, model) => {
        const state = get();

        if (!state.file) return null;

        if (state.file === file && state.model === model) {
          return {
            file: state.file,
            model: state.model,
            status: state.status,
            progress: state.progress,
            segments: state.segments,
            error: state.error,
          };
        }

        return null;
      },
    }),
    {
      name: "transcription-storage",
    }
  )
);
