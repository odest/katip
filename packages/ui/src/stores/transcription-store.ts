import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Segment {
  start: number;
  end: number;
  text: string;
}

export type TranscriptionStatus =
  | "queued"
  | "processingAudio"
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
  recordingId: string | null;
}

interface TranscriptionStore extends TranscriptionState {
  setTranscriptionState: (state: Partial<TranscriptionState>) => void;
  getTranscriptionState: () => TranscriptionState | null;
  clearTranscriptionState: () => void;
}

export const useTranscriptionStore = create(
  persist<TranscriptionStore>(
    (set, get) => ({
      file: null,
      model: null,
      status: "queued" as TranscriptionStatus,
      progress: 0,
      segments: [],
      error: null,
      recordingId: null,

      setTranscriptionState: (state) =>
        set((prev) => ({
          ...prev,
          ...state,
        })),

      getTranscriptionState: () => {
        const state = get();
        if (!state.file && !state.recordingId) return null;

        return {
          file: state.file,
          model: state.model,
          status: state.status,
          progress: state.progress,
          segments: state.segments,
          error: state.error,
          recordingId: state.recordingId,
        };
      },

      clearTranscriptionState: () =>
        set({
          file: null,
          model: null,
          status: "processingAudio" as TranscriptionStatus,
          progress: 0,
          segments: [],
          error: null,
          recordingId: null,
        }),
    }),
    {
      name: "transcription-storage",
    }
  )
);
