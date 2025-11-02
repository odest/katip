import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { toast } from "sonner";
import { useTranslations } from "@workspace/i18n";
import { useAudioStore } from "@workspace/ui/stores/audio-store";
import { useModelStore } from "@workspace/ui/stores/model-store";
import { useLanguageStore } from "@workspace/ui/stores/language-store";
import { usePerformanceStore } from "@workspace/ui/stores/performance-store";
import { useAdvancedStore } from "@workspace/ui/stores/advanced-store";
import type {
  TranscriptionStatus,
  Segment,
  TranscriptionState,
} from "@workspace/ui/stores/transcription-store";

interface UseTranscriptionParams {
  initialState: TranscriptionState | null;
  setStatus: Dispatch<SetStateAction<TranscriptionStatus>>;
  setProgress: Dispatch<SetStateAction<number>>;
  setSegments: Dispatch<SetStateAction<Segment[]>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setTranscriptionState: (state: TranscriptionState) => void;
}

export function useTranscriptionProcess({
  initialState,
  setStatus,
  setProgress,
  setSegments,
  setError,
  setTranscriptionState,
}: UseTranscriptionParams) {
  const progressRef = useRef(0);
  const t = useTranslations("TranscriptionView");

  const { selectedAudio } = useAudioStore();
  const { selectedModel } = useModelStore();
  const { language, translateToEnglish } = useLanguageStore();
  const { useGPU, threadCount } = usePerformanceStore();
  const advancedSettings = useAdvancedStore();

  useEffect(() => {
    let unlisteners: Array<() => void> = [];

    const setupListeners = async () => {
      unlisteners.push(
        await listen<{ progress: number }>("transcribe_progress", (event) => {
          const newProgress = event.payload.progress;
          setProgress(newProgress);
          progressRef.current = newProgress;
        })
      );

      unlisteners.push(
        await listen<Segment>("new_segment", (event) => {
          setSegments((prev) => {
            const exists = prev.some(
              (s) =>
                s.start === event.payload.start && s.text === event.payload.text
            );
            if (exists) {
              return prev;
            }
            const newSegments = [...prev, event.payload];

            setTranscriptionState({
              file: selectedAudio as string,
              model: selectedModel as string,
              status: "transcribing",
              progress: progressRef.current,
              segments: newSegments,
              error: null,
            });

            return newSegments;
          });
        })
      );

      unlisteners.push(
        await listen("transcribe_completed", () => {
          setStatus("done");
          setProgress(100);

          setTimeout(() => {
            setSegments((currentSegments) => {
              setTranscriptionState({
                file: selectedAudio as string,
                model: selectedModel as string,
                status: "done",
                progress: 100,
                segments: currentSegments,
                error: null,
              });

              toast.success(t("transcriptionCompleted"));
              return currentSegments;
            });
          }, 0);
        })
      );

      unlisteners.push(
        await listen<string>("transcribe_error", (event) => {
          const errorMessage = event.payload;
          setError(errorMessage);
          setStatus("error");

          setTranscriptionState({
            file: selectedAudio as string,
            model: selectedModel as string,
            status: "error",
            progress: 0,
            segments: [],
            error: errorMessage,
          });

          toast.error(t("transcriptionFailed"), {
            description: errorMessage,
          });
        })
      );

      unlisteners.push(
        await listen("transcribe_cancelled", () => {
          setStatus("done");
          setProgress(100);

          toast.info(t("transcriptionCancelled"), {
            description: t("transcriptionCancelledDesc"),
          });
        })
      );
    };

    const runTranscription = async () => {
      await setupListeners();

      if (
        initialState?.status === "done" ||
        initialState?.status === "loadingModel" ||
        initialState?.status === "transcribing"
      ) {
        console.log(
          "Transcription already in progress or completed, skipping new start"
        );
        return;
      }

      try {
        setStatus("loadingModel");
        setTranscriptionState({
          file: selectedAudio as string,
          model: selectedModel as string,
          status: "loadingModel",
          progress: 0,
          segments: [],
          error: null,
        });

        await invoke("load_model", {
          modelPath: selectedModel,
          useGpu: useGPU,
          gpuDevice: advancedSettings.gpuDevice,
        });

        setStatus("transcribing");
        setTranscriptionState({
          file: selectedAudio as string,
          model: selectedModel as string,
          status: "transcribing",
          progress: 0,
          segments: [],
          error: null,
        });

        await invoke("transcribe", {
          options: {
            audioPath: selectedAudio,
            language: language,
            translate: translateToEnglish,
            threadCount: threadCount,
            strategy: advancedSettings.strategy,
            bestOf: advancedSettings.bestOf,
            beamSize: advancedSettings.beamSize,
            temperature: advancedSettings.temperature,
            initialPrompt: advancedSettings.initialPrompt,
            patience: advancedSettings.patience,
            splitOnWord: advancedSettings.splitOnWord,
            suppressBlank: advancedSettings.suppressBlank,
            suppressNonSpeechTokens: advancedSettings.suppressNonSpeechTokens,
            tokenTimestamps: advancedSettings.tokenTimestamps,
            maxLength: advancedSettings.maxLength,
          },
        });
      } catch (err) {
        const errorMessage =
          typeof err === "string" ? err : JSON.stringify(err);
        setError(errorMessage);
        setStatus("error");
        toast.error(t("transcriptionFailed"), {
          description: errorMessage,
        });
      }
    };

    runTranscription();

    // Cleanup: remove event listeners on unmount
    return () => {
      unlisteners.forEach((unlisten) => unlisten());
    };
  }, []);
}
