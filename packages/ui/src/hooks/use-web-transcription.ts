import { useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useTranslations } from "@workspace/i18n";
import { calculateFileHash, getAudioDuration } from "@workspace/ui/lib/utils";
import { useSummaries } from "@workspace/ui/hooks/use-summaries";
import { useRecordings } from "@workspace/ui/hooks/use-recordings";
import { useTranscripts } from "@workspace/ui/hooks/use-transcripts";
import { useActionItems } from "@workspace/ui/hooks/use-action-items";
import { useAuthStore } from "@workspace/ui/stores/auth-store";
import { useAudioStore } from "@workspace/ui/stores/audio-store";
import { useModelStore } from "@workspace/ui/stores/model-store";
import { useSummaryStore } from "@workspace/ui/stores/summary-store";
import { useLanguageStore } from "@workspace/ui/stores/language-store";
import {
  useTranscriptionStore,
  type Segment,
} from "@workspace/ui/stores/transcription-store";

interface ProgressItem {
  file: string;
  loaded: number;
  progress: number;
  total: number;
  name: string;
  status: string;
}

interface WorkerMessage {
  status: string;
  data?: any;
  file?: string;
  loaded?: number;
  progress?: number;
  total?: number;
  name?: string;
}

export function useWebTranscription() {
  const workerRef = useRef<Worker | null>(null);
  const fileHashRef = useRef<string | null>(null);
  const recordingIdRef = useRef<string | null>(null);
  const progressItemsRef = useRef<ProgressItem[]>([]);
  const audioDurationRef = useRef<number>(0);
  const hasStartedRef = useRef<boolean>(false);
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
  const { setShowSideViews, setSummaryResult } = useSummaryStore();

  const {
    status,
    setStatus,
    setProgress,
    setSegments,
    setError,
    setTranscriptionState,
  } = useTranscriptionStore();

  const isActiveTranscription =
    status === "processingAudio" ||
    status === "loadingModel" ||
    status === "transcribing";

  const transcribe = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    const selectedAudio = useAudioStore.getState().selectedAudio;
    const selectedModel = useModelStore.getState().selectedModel;
    const useQuantized = useModelStore.getState().useQuantized;

    progressItemsRef.current = [];
    audioDurationRef.current = 0;

    setTranscriptionState({
      file:
        selectedAudio instanceof File
          ? selectedAudio.name
          : (selectedAudio as string),
      model: selectedModel as string,
      status: "processingAudio",
      progress: 0,
      segments: [],
      error: null,
    });

    workerRef.current = new Worker(
      new URL("@workspace/ui/lib/whisper-worker.ts", import.meta.url),
      { type: "module" }
    );

    const worker = workerRef.current;

    const handleWorkerMessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      const currentAudio = useAudioStore.getState().selectedAudio;
      const currentModel = useModelStore.getState().selectedModel;

      switch (message.status) {
        case "initiate":
          if (message.file) {
            const newItem = {
              file: message.file,
              loaded: message.loaded || 0,
              progress: message.progress || 0,
              total: message.total || 0,
              name: message.name || "",
              status: message.status,
            };
            progressItemsRef.current.push(newItem);
          }
          setTranscriptionState({
            file:
              currentAudio instanceof File
                ? currentAudio.name
                : (currentAudio as string),
            model: currentModel as string,
            status: "loadingModel",
            progress: 0,
            segments: [],
            error: null,
          });
          break;

        case "progress":
          if (message.file) {
            progressItemsRef.current = progressItemsRef.current.map((item) => {
              if (item.file === message.file) {
                return { ...item, progress: message.progress || 0 };
              }
              return item;
            });

            const totalProgress =
              progressItemsRef.current.reduce(
                (sum, item) => sum + item.progress,
                0
              ) / progressItemsRef.current.length;
            setProgress(totalProgress);
          }
          break;

        case "done":
          if (message.file) {
            progressItemsRef.current = progressItemsRef.current.map((item) =>
              item.file === message.file ? { ...item, progress: 100 } : item
            );

            const totalProgress =
              progressItemsRef.current.reduce(
                (sum, item) => sum + item.progress,
                0
              ) / progressItemsRef.current.length;
            setProgress(totalProgress);
          }
          break;

        case "ready":
          setTranscriptionState({
            file:
              currentAudio instanceof File
                ? currentAudio.name
                : (currentAudio as string),
            model: currentModel as string,
            status: "transcribing",
            progress: 0,
            segments: [],
            error: null,
          });
          break;

        case "update":
          if (message.data) {
            const chunks = message.data[1]?.chunks || [];
            const newSegments: Segment[] = chunks.map((chunk: any) => ({
              start: chunk.timestamp[0],
              end: chunk.timestamp[1] || chunk.timestamp[0],
              text: chunk.text.trim(),
            }));

            let estimatedProgress = 0;
            const lastSegment = newSegments[newSegments.length - 1];
            if (lastSegment && audioDurationRef.current > 0) {
              estimatedProgress = Math.min(
                99,
                (lastSegment.end / audioDurationRef.current) * 100
              );
            }

            setTranscriptionState({
              status: "transcribing",
              progress: estimatedProgress,
              segments: newSegments,
            });
          }
          break;

        case "complete":
          if (message.data) {
            const chunks = message.data.chunks || [];
            const finalSegments: Segment[] = chunks.map((chunk: any) => ({
              start: chunk.timestamp[0],
              end: chunk.timestamp[1] || chunk.timestamp[0],
              text: chunk.text.trim(),
            }));

            setTranscriptionState({
              status: "done",
              progress: 100,
              segments: finalSegments,
              error: null,
            });

            toast.success(t("transcriptionComplete"));

            const currentUserId = useAuthStore.getState().userId;
            const currentLanguage = useLanguageStore.getState().language;

            if (currentUserId && currentAudio instanceof File) {
              (async () => {
                try {
                  let recordingId = recordingIdRef.current;

                  if (!recordingId && fileHashRef.current) {
                    const duration = await getAudioDuration(
                      URL.createObjectURL(currentAudio)
                    );
                    recordingId = uuidv4();

                    await addRecording({
                      id: recordingId,
                      userId: currentUserId,
                      title: currentAudio.name || "Untitled",
                      description: null,
                      filePath: currentAudio.name,
                      fileHash: fileHashRef.current,
                      duration: duration,
                      fileSize: currentAudio.size,
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
                      segments: finalSegments,
                      createdAt: new Date(),
                    });
                  }
                } catch (error) {
                  console.error("Failed to save transcription:", error);
                }
              })();
            }
          }
          break;

        case "error":
          const errorMessage =
            typeof message.data === "string"
              ? message.data
              : "Unknown error occurred";

          setTranscriptionState({
            file:
              currentAudio instanceof File
                ? currentAudio.name
                : (currentAudio as string),
            model: currentModel as string,
            status: "error",
            progress: 0,
            segments: [],
            error: errorMessage,
          });

          toast.error(t("transcriptionFailed"), {
            description: errorMessage,
          });
          break;

        default:
          break;
      }
    };

    worker.addEventListener("message", handleWorkerMessage);

    const start = async () => {
      const currentRecordingId = useTranscriptionStore.getState().recordingId;
      const currentLanguage = useLanguageStore.getState().language;
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

        if (!selectedAudio || !selectedModel) {
          setTranscriptionState({
            status: "error",
            error: "Audio or model not available",
          });
          return;
        }

        if (!(selectedAudio instanceof File)) {
          throw new Error("Invalid audio file. Expected a File object.");
        }

        if (selectedAudio.size === 0) {
          throw new Error("Audio file is empty or invalid.");
        }

        const hash = await calculateFileHash(selectedAudio);
        fileHashRef.current = hash;

        const existingRecording = await getRecordingByHash(hash);

        if (existingRecording) {
          recordingIdRef.current = existingRecording.id;
          const transcript = await getTranscriptByRecordingId(
            existingRecording.id,
            selectedModel as string,
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

        const arrayBuffer = await selectedAudio.arrayBuffer();
        const audioContext = new AudioContext({ sampleRate: 16000 });
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioDurationRef.current = audioBuffer.duration;

        let audio: Float32Array;

        if (audioBuffer.numberOfChannels === 1) {
          audio = audioBuffer.getChannelData(0);
        } else {
          const length = audioBuffer.length;
          const channels = audioBuffer.numberOfChannels;
          audio = new Float32Array(length);

          const channelData: Float32Array[] = [];
          for (let c = 0; c < channels; c++) {
            channelData.push(audioBuffer.getChannelData(c));
          }

          for (let i = 0; i < length; i++) {
            let sum = 0;
            for (let c = 0; c < channels; c++) {
              sum += channelData[c]![i]!;
            }
            audio[i] = sum / channels;
          }
        }

        setStatus("loadingModel");

        const task = currentTranslate ? "translate" : "transcribe";
        const lang = currentLanguage === "auto" ? null : currentLanguage;

        worker.postMessage({
          audio,
          model: selectedModel,
          quantized: useQuantized,
          language: lang,
          task,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to start transcription";
        setTranscriptionState({
          status: "error",
          error: errorMessage,
        });
        toast.error(t("transcriptionFailed"), {
          description: errorMessage,
        });
      }
    };

    start();
  }, [
    t,
    setStatus,
    setProgress,
    setSegments,
    setError,
    setTranscriptionState,
    addRecording,
    addTranscript,
    getRecordingByHash,
    getRecordingById,
    getTranscriptByRecordingId,
    getFirstTranscriptByRecordingId,
    getSummaryByRecordingId,
    getActionItemsBySummaryId,
    setSummaryResult,
    setShowSideViews,
  ]);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    if (isActiveTranscription && workerRef.current) {
      console.log("Transcription already in progress, skipping new start");
      return;
    }

    hasStartedRef.current = true;
    transcribe();

    return () => {
      hasStartedRef.current = false;
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const cancel = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      toast.info(t("cancellingTranscription"));
      return true;
    }
    return false;
  }, [t]);

  return { cancel, transcribe };
}
