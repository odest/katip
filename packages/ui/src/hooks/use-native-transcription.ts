import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { stat } from "@tauri-apps/plugin-fs";
import { listen } from "@tauri-apps/api/event";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useTranslations } from "@workspace/i18n";
import { getAudioDuration } from "@workspace/ui/lib/utils";
import { useSummaries } from "@workspace/ui/hooks/use-summaries";
import { useRecordings } from "@workspace/ui/hooks/use-recordings";
import { useTranscripts } from "@workspace/ui/hooks/use-transcripts";
import { useActionItems } from "@workspace/ui/hooks/use-action-items";
import { useAuthStore } from "@workspace/ui/stores/auth-store";
import { useAudioStore } from "@workspace/ui/stores/audio-store";
import { useModelStore } from "@workspace/ui/stores/model-store";
import { useSummaryStore } from "@workspace/ui/stores/summary-store";
import { useLanguageStore } from "@workspace/ui/stores/language-store";
import { useAdvancedStore } from "@workspace/ui/stores/advanced-store";
import { usePerformanceStore } from "@workspace/ui/stores/performance-store";
import type {
  Segment,
  TranscriptionState,
  TranscriptionStatus,
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
  const fileHashRef = useRef<string | null>(null);
  const recordingIdRef = useRef<string | null>(null);
  const t = useTranslations("TranscriptionView");

  const { addRecording, getRecordingByHash } = useRecordings();
  const { addTranscript, getTranscriptByRecordingId } = useTranscripts();
  const { getSummaryByRecordingId } = useSummaries();
  const { getActionItemsBySummaryId } = useActionItems();

  const { selectedAudio } = useAudioStore();
  const { selectedModel } = useModelStore();
  const { language, translateToEnglish } = useLanguageStore();
  const { useGPU, threadCount } = usePerformanceStore();
  const advancedSettings = useAdvancedStore();
  const { setShowSideViews, setSummaryResult } = useSummaryStore();

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
        await listen("transcribe_completed", async () => {
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

              const currentUserId = useAuthStore.getState().userId;

              if (currentUserId) {
                (async () => {
                  let recordingId = recordingIdRef.current;

                  if (!recordingId && fileHashRef.current) {
                    const duration = await getAudioDuration(
                      convertFileSrc(selectedAudio as string)
                    );
                    const metadata = await stat(selectedAudio as string);
                    recordingId = uuidv4();

                    await addRecording({
                      id: recordingId,
                      userId: currentUserId,
                      title:
                        (selectedAudio as string).split(/[\\/]/).pop() ||
                        "Untitled",
                      description: null,
                      filePath: selectedAudio as string,
                      fileHash: fileHashRef.current,
                      duration: duration,
                      fileSize: metadata.size,
                      status: "completed",
                      isFavorite: false,
                      tags: null,
                      color: null,
                      isSynced: false,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      deletedAt: null,
                    });
                  }

                  if (recordingId) {
                    const transcriptId = uuidv4();
                    await addTranscript({
                      id: transcriptId,
                      recordingId: recordingId,
                      userId: currentUserId,
                      language: language,
                      model: selectedModel as string,
                      segments: currentSegments,
                      createdAt: new Date(),
                    });
                  }
                })();
              }

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
        const hash = await invoke<string>("calculate_file_hash", {
          path: selectedAudio,
        });
        fileHashRef.current = hash;

        const existingRecording = await getRecordingByHash(hash);

        if (existingRecording) {
          recordingIdRef.current = existingRecording.id;
          const transcript = await getTranscriptByRecordingId(
            existingRecording.id,
            selectedModel as string,
            language
          );

          if (transcript) {
            const segments = transcript.segments
              ? (transcript.segments as Segment[])
              : [];

            setStatus("done");
            setProgress(100);
            setSegments(segments);
            setTranscriptionState({
              file: existingRecording.filePath,
              model: transcript.model as string,
              status: "done",
              progress: 100,
              segments: segments,
              error: null,
            });

            try {
              const summary = await getSummaryByRecordingId(
                existingRecording.id
              );

              if (summary) {
                const actionItems = await getActionItemsBySummaryId(summary.id);
                setSummaryResult({
                  summary: summary.content as string,
                  action_items: actionItems.map((item) => ({
                    task: item.task,
                    assignee: item.assignee ?? "Unassigned",
                    completed: item.isCompleted ?? false,
                    priority: item.priority ?? "",
                  })),
                });
                setShowSideViews(true);
              } else {
                setSummaryResult(null);
              }
            } catch (error) {
              console.error("Failed to fetch summary:", error);
            }
            return;
          }
        }
      } catch (error) {
        console.error("Failed to calculate hash or check history:", error);
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
        setTranscriptionState({
          file: selectedAudio as string,
          model: selectedModel as string,
          status: "error",
          progress: 0,
          segments: [],
          error: null,
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
