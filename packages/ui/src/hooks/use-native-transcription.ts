import { useEffect, useRef } from "react";
import { stat, exists } from "@tauri-apps/plugin-fs";
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
import {
  useTranscriptionStore,
  type Segment,
} from "@workspace/ui/stores/transcription-store";

export function useTranscriptionProcess() {
  const progressRef = useRef(0);
  const segmentsRef = useRef<Segment[]>([]);
  const fileHashRef = useRef<string | null>(null);
  const recordingIdRef = useRef<string | null>(null);
  const hasStartedRef = useRef(false);
  const t = useTranslations("TranscriptionView");

  const { addRecording, getRecordingByHash, getRecordingById } =
    useRecordings();
  const {
    addTranscript,
    getTranscriptByRecordingId,
    getFirstTranscriptByRecordingId,
  } = useTranscripts();
  const { getSummaryByRecordingId } = useSummaries();
  const { getActionItemsBySummaryId } = useActionItems();

  const { setSelectedAudio } = useAudioStore();
  const { setShowSideViews, setSummaryResult } = useSummaryStore();
  const { status, setStatus, setProgress, addSegment, setTranscriptionState } =
    useTranscriptionStore();

  const isActiveTranscription =
    status === "processingAudio" ||
    status === "loadingModel" ||
    status === "transcribing";

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

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
          const newSegment = event.payload;
          const currentSegments = useTranscriptionStore.getState().segments;

          const exists = currentSegments.some(
            (s) => s.start === newSegment.start && s.text === newSegment.text
          );

          if (!exists) {
            addSegment(newSegment);
            segmentsRef.current = [...currentSegments, newSegment];
          }
        })
      );

      unlisteners.push(
        await listen("transcribe_completed", async () => {
          const currentSegments = useTranscriptionStore.getState().segments;

          setTranscriptionState({
            status: "done",
            progress: 100,
          });

          toast.success(t("transcriptionCompleted"));

          const currentUserId = useAuthStore.getState().userId;
          const currentAudio = useAudioStore.getState().selectedAudio;
          const currentModel = useModelStore.getState().selectedModel;
          const currentLanguage = useLanguageStore.getState().language;

          if (currentUserId && currentAudio) {
            try {
              let recordingId = recordingIdRef.current;

              if (!recordingId && fileHashRef.current) {
                const duration = await getAudioDuration(
                  convertFileSrc(currentAudio as string)
                );
                const metadata = await stat(currentAudio as string);
                recordingId = uuidv4();

                await addRecording({
                  id: recordingId,
                  userId: currentUserId,
                  title:
                    (currentAudio as string).split(/[\\/]/).pop() || "Untitled",
                  description: null,
                  filePath: currentAudio as string,
                  fileHash: fileHashRef.current,
                  duration: duration,
                  fileSize: metadata.size,
                  status: "completed",
                  isFavorite: false,
                  tags: null,
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
                  language: currentLanguage,
                  model: currentModel as string,
                  segments: currentSegments,
                  createdAt: new Date(),
                });
              }
            } catch (error) {
              console.error("Failed to save transcription:", error);
            }
          }
        })
      );

      unlisteners.push(
        await listen<string>("transcribe_error", (event) => {
          const errorMessage = event.payload;

          setTranscriptionState({
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
        await listen("transcribe_cancelled", async () => {
          const currentSegments = segmentsRef.current;
          const currentProgress = progressRef.current;

          setTranscriptionState({
            status: "cancelled",
            progress: currentProgress,
            segments: currentSegments,
            error: null,
          });

          toast.info(t("transcriptionCancelled"), {
            description: t("transcriptionCancelledDesc"),
          });

          if (currentSegments.length > 0) {
            const currentUserId = useAuthStore.getState().userId;
            const currentAudio = useAudioStore.getState().selectedAudio;
            const currentModel = useModelStore.getState().selectedModel;
            const currentLanguage = useLanguageStore.getState().language;

            if (currentUserId && currentAudio) {
              try {
                let recordingId = recordingIdRef.current;

                if (!recordingId && fileHashRef.current) {
                  const duration = await getAudioDuration(
                    convertFileSrc(currentAudio as string)
                  );
                  const metadata = await stat(currentAudio as string);
                  recordingId = uuidv4();

                  await addRecording({
                    id: recordingId,
                    userId: currentUserId,
                    title:
                      (currentAudio as string).split(/[\\/]/).pop() ||
                      "Untitled",
                    description: null,
                    filePath: currentAudio as string,
                    fileHash: fileHashRef.current,
                    duration: duration,
                    fileSize: metadata.size,
                    status: "cancelled",
                    isFavorite: false,
                    tags: null,
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
                    language: currentLanguage,
                    model: currentModel as string,
                    segments: currentSegments,
                    createdAt: new Date(),
                  });
                }
              } catch (error) {
                console.error("Failed to save cancelled transcription:", error);
              }
            }
          }
        })
      );
    };

    const runTranscription = async () => {
      await setupListeners();

      if (isActiveTranscription) {
        console.log("Transcription already in progress, skipping new start");
        return;
      }

      const currentStatus = useTranscriptionStore.getState().status;
      if (currentStatus === "done") {
        console.log("Transcription already completed, skipping new start");
        return;
      }

      hasStartedRef.current = true;

      const currentAudio = useAudioStore.getState().selectedAudio;
      const currentModel = useModelStore.getState().selectedModel;
      const currentRecordingId = useTranscriptionStore.getState().recordingId;
      const currentLanguage = useLanguageStore.getState().language;
      const currentUseGPU = usePerformanceStore.getState().useGPU;
      const currentThreadCount = usePerformanceStore.getState().threadCount;
      const currentAdvanced = useAdvancedStore.getState();
      const currentTranslate = useLanguageStore.getState().translateToEnglish;

      try {
        // If we have a recordingId from store (e.g., navigating from RecordingsPage),
        // load directly from DB without file check or hash calculation
        if (currentRecordingId) {
          const existingRecording = await getRecordingById(currentRecordingId);

          if (existingRecording) {
            recordingIdRef.current = existingRecording.id;

            const transcript = await getFirstTranscriptByRecordingId(
              existingRecording.id
            );

            if (transcript) {
              const segments = transcript.segments
                ? (transcript.segments as Segment[])
                : [];

              setSelectedAudio(existingRecording.filePath);
              setTranscriptionState({
                file: existingRecording.filePath,
                model: transcript.model as string,
                status: "done",
                progress: 100,
                segments: segments,
                error: null,
                recordingId: existingRecording.id,
              });

              try {
                const summary = await getSummaryByRecordingId(
                  existingRecording.id
                );

                if (summary && summary.content) {
                  const actionItems = await getActionItemsBySummaryId(
                    summary.id
                  );
                  setSummaryResult({
                    summary: summary.content as string,
                    action_items: actionItems.map((item) => ({
                      id: item.id,
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
        }

        const fileExists = await exists(currentAudio as string);
        if (!fileExists) {
          const errorMessage = `File not found: ${currentAudio}`;
          setTranscriptionState({
            file: currentAudio as string,
            model: currentModel as string,
            status: "error",
            progress: 0,
            segments: [],
            error: errorMessage,
          });
          return;
        }

        const hash = await invoke<string>("calculate_file_hash", {
          path: currentAudio,
        });
        fileHashRef.current = hash;

        const existingRecording = await getRecordingByHash(hash);

        if (existingRecording) {
          recordingIdRef.current = existingRecording.id;
          const transcript = await getTranscriptByRecordingId(
            existingRecording.id,
            currentModel as string,
            currentLanguage
          );

          if (transcript) {
            const segments = transcript.segments
              ? (transcript.segments as Segment[])
              : [];

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

              if (summary && summary.content) {
                const actionItems = await getActionItemsBySummaryId(summary.id);
                setSummaryResult({
                  summary: summary.content as string,
                  action_items: actionItems.map((item) => ({
                    id: item.id,
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
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to access audio file";
        setTranscriptionState({
          file: currentAudio as string,
          model: currentModel as string,
          status: "error",
          progress: 0,
          segments: [],
          error: errorMessage,
        });
        return;
      }

      try {
        setTranscriptionState({
          file: currentAudio as string,
          model: currentModel as string,
          status: "processingAudio",
          progress: 0,
          segments: [],
          error: null,
        });

        await invoke("process_audio", {
          audioPath: currentAudio,
        });

        setStatus("loadingModel");

        await invoke("load_model", {
          modelPath: currentModel,
          useGpu: currentUseGPU,
          gpuDevice: currentAdvanced.gpuDevice,
        });

        setStatus("transcribing");

        await invoke("transcribe", {
          options: {
            language: currentLanguage,
            translate: currentTranslate,
            threadCount: currentThreadCount,
            strategy: currentAdvanced.strategy,
            bestOf: currentAdvanced.bestOf,
            beamSize: currentAdvanced.beamSize,
            temperature: currentAdvanced.temperature,
            initialPrompt: currentAdvanced.initialPrompt,
            patience: currentAdvanced.patience,
            splitOnWord: currentAdvanced.splitOnWord,
            suppressBlank: currentAdvanced.suppressBlank,
            suppressNonSpeechTokens: currentAdvanced.suppressNonSpeechTokens,
            tokenTimestamps: currentAdvanced.tokenTimestamps,
            maxLength: currentAdvanced.maxLength,
          },
        });
      } catch (err) {
        const errorMessage =
          typeof err === "string" ? err : JSON.stringify(err);
        setTranscriptionState({
          file: currentAudio as string,
          model: currentModel as string,
          status: "error",
          progress: 0,
          segments: [],
          error: errorMessage,
        });
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

  const resetAndRestart = () => {
    hasStartedRef.current = false;
  };

  return { resetAndRestart };
}
