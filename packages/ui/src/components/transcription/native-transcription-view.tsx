import {
  useEffect,
  useState,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { useTranslations } from "@workspace/i18n";
import { useAudioStore } from "@workspace/ui/stores/audio-store";
import { useModelStore } from "@workspace/ui/stores/model-store";
import {
  useTranscriptionStore,
  TranscriptionStatus,
  Segment,
} from "@workspace/ui/stores/transcription-store";
import { Progress } from "@workspace/ui/components/progress";
import { Textarea } from "@workspace/ui/components/textarea";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { EmptyState } from "@workspace/ui/components/common/empty-state";
import { Ban, AlertCircle, Bug } from "lucide-react";
import { useTranscriptionProcess } from "@workspace/ui/hooks/use-native-transcription";
import { formatSegmentsToText } from "@workspace/ui/lib/utils";

interface NativeTranscriptionViewProps {
  onStatusChange?: (status: TranscriptionStatus) => void;
}

export interface NativeTranscriptionViewHandle {
  cancelTranscription: () => Promise<void>;
  retryTranscription: () => void;
}

export const NativeTranscriptionView = forwardRef<
  NativeTranscriptionViewHandle,
  NativeTranscriptionViewProps
>(({ onStatusChange }, ref) => {
  const t = useTranslations("TranscriptionView");

  const { selectedAudio } = useAudioStore();
  const { selectedModel } = useModelStore();
  const { checkTranscriptionMatch, setTranscriptionState } =
    useTranscriptionStore();

  const initialState = useMemo(
    () =>
      checkTranscriptionMatch(
        selectedAudio as string,
        selectedModel as string
      ) || null,
    [selectedAudio, selectedModel, checkTranscriptionMatch]
  );

  const [status, setStatus] = useState<TranscriptionStatus>(
    initialState?.status || "loadingModel"
  );
  const [progress, setProgress] = useState(initialState?.progress || 0);
  const [segments, setSegments] = useState<Segment[]>(
    initialState?.segments || []
  );
  const [error, setError] = useState<string | null>(
    initialState?.error || null
  );
  const [editableTranscription, setEditableTranscription] = useState("");

  const fullTranscription = useMemo(
    () => formatSegmentsToText(segments, "desktop"),
    [segments]
  );

  useEffect(() => {
    setEditableTranscription(fullTranscription);
  }, [fullTranscription]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useImperativeHandle(
    ref,
    () => ({
      cancelTranscription: async () => {
        try {
          await invoke("cancel_transcription");
          toast.info(t("cancellingTranscription"));
        } catch (err) {
          console.error("Failed to cancel transcription:", err);
          toast.error(t("failedToCancel"));
        }
      },
      retryTranscription: () => {
        window.location.reload();
      },
    }),
    [t]
  );

  // start transcription process
  useTranscriptionProcess({
    initialState,
    setStatus,
    setProgress,
    setSegments,
    setError,
    setTranscriptionState,
  });

  if (status === "error") {
    return (
      <div className="flex flex-1 justify-center items-center p-6">
        <EmptyState
          title={t("transcriptionFailed")}
          description={error || t("transcriptionFailedDesc")}
          className="border-destructive hover:border-destructive/80"
          icons={[Ban, AlertCircle, Bug]}
          action={{
            label: t("tryAgain"),
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    );
  }

  if (status === "loadingModel") {
    return (
      <div className="flex flex-1 justify-center items-center p-6">
        <div className="w-full max-w-md flex flex-col items-center gap-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">{t("loadingModel")}</h2>
            <p className="text-muted-foreground">{t("preparingModel")}</p>
          </div>
          <div className="w-full space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("loading")}</span>
              <span className="font-medium">{progress.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full gap-4 p-6">
      {status === "transcribing" && (
        <div className="w-full max-w-2xl mx-auto space-y-3">
          <div className="text-center">
            <h2 className="text-xl font-bold">{t("transcribingAudio")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("segmentsAppearRealtime")}
            </p>
          </div>
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {segments.length}{" "}
                {segments.length !== 1 ? t("segments") : t("segment")}{" "}
                {t("processed")}
              </span>
              <span className="font-medium">{progress.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="text-center space-y-2 max-w-2xl mx-auto w-full">
          <h2 className="text-2xl font-bold">{t("transcriptionComplete")}</h2>
          <p className="text-muted-foreground">
            {t("transcriptionCompleteDesc")}
          </p>
        </div>
      )}

      <div className="flex-1 min-h-0 max-w-3xl mx-auto w-full">
        <ScrollArea className="h-full w-full rounded-md border">
          <Textarea
            value={editableTranscription}
            onChange={(e) => setEditableTranscription(e.target.value)}
            placeholder={
              status === "transcribing"
                ? t("transcriptionPlaceholderRealtime")
                : t("transcriptionPlaceholder")
            }
            className="min-h-[calc(100vh-250px)] w-full p-4 focus-visible:ring-0 focus-visible:ring-offset-0 border-none shadow-none resize-none"
            readOnly={status !== "done"}
          />
        </ScrollArea>
      </div>
    </div>
  );
});

NativeTranscriptionView.displayName = "NativeTranscriptionView";
