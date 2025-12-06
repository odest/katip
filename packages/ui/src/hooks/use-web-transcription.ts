import {
  useRef,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
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
  Segment,
  TranscriptionState,
  TranscriptionStatus,
} from "@workspace/ui/stores/transcription-store";

interface UseWebTranscriptionParams {
  isActiveTranscription: boolean;
  storeRecordingId: string | null;
  setStatus: Dispatch<SetStateAction<TranscriptionStatus>>;
  setProgress: Dispatch<SetStateAction<number>>;
  setSegments: Dispatch<SetStateAction<Segment[]>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setTranscriptionState: (state: Partial<TranscriptionState>) => void;
  setDownloadingFiles: Dispatch<
    SetStateAction<
      Array<{ name: string; progress: number; status: "loading" | "done" }>
    >
  >;
}

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

export function useWebTranscription({
  isActiveTranscription,
  storeRecordingId,
  setStatus,
  setProgress,
  setSegments,
  setError,
  setTranscriptionState,
  setDownloadingFiles,
}: UseWebTranscriptionParams) {
  const workerRef = useRef<Worker | null>(null);
  const fileHashRef = useRef<string | null>(null);
  const recordingIdRef = useRef<string | null>(null);
  const progressItemsRef = useRef<ProgressItem[]>([]);
  const audioDurationRef = useRef<number>(0);
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

  const { selectedAudio } = useAudioStore();
  const { selectedModel, useQuantized } = useModelStore();
  const { language, translateToEnglish } = useLanguageStore();
  const { setShowSideViews, setSummaryResult } = useSummaryStore();

  const transcribe = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    progressItemsRef.current = [];
    audioDurationRef.current = 0;
    setError(null);
    setSegments([]);
    setProgress(0);
    setStatus("loadingModel");
    setDownloadingFiles([]);

    workerRef.current = new Worker(
      new URL("@workspace/ui/lib/whisper-worker.ts", import.meta.url),
      {
        type: "module",
      }
    );

    const worker = workerRef.current;

    const handleWorkerMessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;

      switch (message.status) {
        case "initiate":
          setStatus("loadingModel");
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

            setDownloadingFiles((prev) => [
              ...prev,
              {
                name: message.file || "Unknown file",
                progress: message.progress || 0,
                status: "loading",
              },
            ]);
          }
          setTranscriptionState({
            file: selectedAudio as string,
            model: selectedModel as string,
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

            setDownloadingFiles((prev) =>
              prev.map((file) =>
                file.name === message.file
                  ? { ...file, progress: message.progress || 0 }
                  : file
              )
            );

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
            setDownloadingFiles((prev) =>
              prev.map((file) =>
                file.name === message.file
                  ? { ...file, progress: 100, status: "done" }
                  : file
              )
            );

            progressItemsRef.current = progressItemsRef.current.filter(
              (item) => item.file !== message.file
            );
          }
          break;

        case "ready":
          setStatus("transcribing");
          setProgress(0);
          setTranscriptionState({
            file: selectedAudio as string,
            model: selectedModel as string,
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

            setSegments(newSegments);

            let estimatedProgress = 0;
            const lastSegment = newSegments[newSegments.length - 1];
            if (lastSegment && audioDurationRef.current > 0) {
              estimatedProgress = Math.min(
                99,
                (lastSegment.end / audioDurationRef.current) * 100
              );
            }
            setProgress(estimatedProgress);

            setTranscriptionState({
              file: selectedAudio as string,
              model: selectedModel as string,
              status: "transcribing",
              progress: estimatedProgress,
              segments: newSegments,
              error: null,
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

            setSegments(finalSegments);
            setProgress(100);
            setStatus("done");

            setTranscriptionState({
              file: selectedAudio as string,
              model: selectedModel as string,
              status: "done",
              progress: 100,
              segments: finalSegments,
              error: null,
            });

            toast.success(t("transcriptionComplete"));

            const currentUserId = useAuthStore.getState().userId;

            if (currentUserId) {
              (async () => {
                let recordingId = recordingIdRef.current;

                if (!recordingId && fileHashRef.current) {
                  const duration = await getAudioDuration(
                    URL.createObjectURL(selectedAudio as File)
                  );
                  recordingId = uuidv4();

                  await addRecording({
                    id: recordingId,
                    userId: currentUserId,
                    title: (selectedAudio as File).name || "Untitled",
                    description: null,
                    filePath: (selectedAudio as File).name,
                    fileHash: fileHashRef.current,
                    duration: duration,
                    fileSize: (selectedAudio as File).size,
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
                    language: language,
                    model: selectedModel as string,
                    segments: finalSegments,
                    createdAt: new Date(),
                  });
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
          break;

        default:
          break;
      }
    };

    worker.addEventListener("message", handleWorkerMessage);

    const start = async () => {
      try {
        // If we have a recordingId from store (e.g., navigating from RecordingsPage),
        // load directly from DB without file check or hash calculation
        if (storeRecordingId) {
          const existingRecording = await getRecordingById(storeRecordingId);

          if (existingRecording) {
            recordingIdRef.current = existingRecording.id;

            const transcript = await getFirstTranscriptByRecordingId(
              existingRecording.id
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
                recordingId: existingRecording.id,
              });

              try {
                const summary = await getSummaryByRecordingId(
                  existingRecording.id
                );

                if (summary) {
                  const actionItems = await getActionItemsBySummaryId(
                    summary.id
                  );
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
        }

        if (!selectedAudio || !selectedModel) {
          setError("Audio or model not available");
          setStatus("error");
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

        const arrayBuffer = await selectedAudio.arrayBuffer();
        const audioContext = new AudioContext({
          sampleRate: 16000,
        });
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioDurationRef.current = audioBuffer.duration;

        let audio: Float32Array;

        if (audioBuffer.numberOfChannels === 2) {
          const SCALING_FACTOR = Math.sqrt(2);
          const left = audioBuffer.getChannelData(0);
          const right = audioBuffer.getChannelData(1);

          audio = new Float32Array(left.length);
          for (let i = 0; i < audioBuffer.length; ++i) {
            audio[i] =
              (SCALING_FACTOR * ((left[i] || 0) + (right[i] || 0))) / 2;
          }
        } else {
          audio = audioBuffer.getChannelData(0);
        }

        const task = translateToEnglish ? "translate" : "transcribe";
        const lang = language === "auto" ? null : language;

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
        setError(errorMessage);
        setStatus("error");
        toast.error(t("transcriptionFailed"), {
          description: errorMessage,
        });
      }
    };

    start();
  }, [
    language,
    selectedAudio,
    selectedModel,
    useQuantized,
    setError,
    setSegments,
    setProgress,
    setStatus,
    setTranscriptionState,
    t,
    translateToEnglish,
  ]);

  useEffect(() => {
    if (isActiveTranscription) {
      console.log("Transcription already in progress, skipping new start");
      return;
    }

    transcribe();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [isActiveTranscription, transcribe]);

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
