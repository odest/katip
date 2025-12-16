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
  setFile: (file: string | null) => void;
  setModel: (model: string | null) => void;
  setStatus: (status: TranscriptionStatus) => void;
  setProgress: (progress: number) => void;
  setSegments: (segments: Segment[]) => void;
  addSegment: (segment: Segment) => void;
  setError: (error: string | null) => void;
  setRecordingId: (recordingId: string | null) => void;
  setTranscriptionState: (state: Partial<TranscriptionState>) => void;
  clearTranscriptionState: () => void;
}

const initialState: TranscriptionState = {
  file: null,
  model: null,
  status: "queued",
  progress: 0,
  segments: [],
  error: null,
  recordingId: null,
};

export const useTranscriptionStore = create(
  persist<TranscriptionStore>(
    (set) => ({
      ...initialState,
      setFile: (file) => set({ file }),
      setModel: (model) => set({ model }),
      setStatus: (status) => set({ status }),
      setProgress: (progress) => set({ progress }),
      setSegments: (segments) => set({ segments }),
      addSegment: (segment) =>
        set((state) => ({ segments: [...state.segments, segment] })),
      setError: (error) => set({ error }),
      setRecordingId: (recordingId) => set({ recordingId }),
      setTranscriptionState: (state) =>
        set((prev) => ({
          ...prev,
          ...state,
        })),
      clearTranscriptionState: () => set(initialState),
    }),
    {
      name: "transcription-storage",
    }
  )
);
