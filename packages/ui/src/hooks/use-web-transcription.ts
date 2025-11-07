import {
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";
import { toast } from "sonner";
import { useTranslations } from "@workspace/i18n";
import { useAudioStore } from "@workspace/ui/stores/audio-store";
import { useModelStore } from "@workspace/ui/stores/model-store";
import { useLanguageStore } from "@workspace/ui/stores/language-store";
import {
  TranscriptionState,
  TranscriptionStatus,
  Segment,
} from "@workspace/ui/stores/transcription-store";

interface UseWebTranscriptionParams {
  initialState: TranscriptionState | null;
  setStatus: Dispatch<SetStateAction<TranscriptionStatus>>;
  setProgress: Dispatch<SetStateAction<number>>;
  setSegments: Dispatch<SetStateAction<Segment[]>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setTranscriptionState: (state: TranscriptionState) => void;
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
  initialState,
  setStatus,
  setProgress,
  setSegments,
  setError,
  setTranscriptionState,
  setDownloadingFiles,
}: UseWebTranscriptionParams) {
  const workerRef = useRef<Worker | null>(null);
  const progressItemsRef = useRef<ProgressItem[]>([]);
  const audioDurationRef = useRef<number>(0);
  const t = useTranslations("TranscriptionView");

  const { selectedAudio } = useAudioStore();
  const { selectedModel, useQuantized } = useModelStore();
  const { language, translateToEnglish } = useLanguageStore();

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
      if (!selectedAudio || !selectedModel) {
        setError("Audio or model not available");
        setStatus("error");
        return;
      }

      try {
        if (!(selectedAudio instanceof File)) {
          throw new Error("Invalid audio file. Expected a File object.");
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
    if (
      initialState?.status === "done" ||
      initialState?.status === "cancelled" ||
      initialState?.status === "loadingModel" ||
      initialState?.status === "transcribing"
    ) {
      console.log("Transcription already in progress or completed");
      return;
    }
    transcribe();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [initialState, transcribe]);

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
