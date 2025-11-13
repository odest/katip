import { useState, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
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
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { EmptyState } from "@workspace/ui/components/common/empty-state";
import { Ban, AlertCircle, Bug } from "lucide-react";
import { useTranscriptionProcess } from "@workspace/ui/hooks/use-native-transcription";
import { TranscriptionToolbar } from "@workspace/ui/components/transcription/transcription-toolbar";
import { SegmentList } from "@workspace/ui/components/transcription/segment-list";
import { useRouter } from "@workspace/i18n/navigation";

export const NativeTranscriptionView = () => {
  const router = useRouter();
  const t = useTranslations("TranscriptionView");

  const { selectedAudio } = useAudioStore();
  const { selectedModel } = useModelStore();
  const {
    checkTranscriptionMatch,
    setTranscriptionState,
    clearTranscriptionState,
  } = useTranscriptionStore();

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

  const handleSegmentChange = (index: number, newText: string) => {
    setSegments((prevSegments) => {
      const newSegments = [...prevSegments];
      newSegments[index] = { ...newSegments[index]!, text: newText };
      return newSegments;
    });
  };

  const handleNewTranscription = () => {
    clearTranscriptionState();
    router.push("/");
  };

  const handleRetry = () => {
    clearTranscriptionState();
    window.location.reload();
  };

  const handleCancel = async () => {
    try {
      await invoke("cancel_transcription");
      toast.info(t("cancellingTranscription"));
    } catch (err) {
      console.error("Failed to cancel transcription:", err);
      toast.error(t("failedToCancel"));
    }
  };

  const handleCopy = async () => {
    try {
      const text = segments.map((segment) => segment.text).join("\n");
      await writeText(text);
      toast.success(t("copiedToClipboard"));
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error(t("failedToCopyToClipboard"));
    }
  };

  const handleExport = async () => {
    try {
      const text = segments.map((segment) => segment.text).join("\n");
      const filePath = await save({
        defaultPath: "transcription.txt",
        filters: [{ name: "text/plain", extensions: ["txt"] }],
      });
      if (!filePath) return;
      await writeTextFile(filePath, text);
      toast.success(t("exportedSuccessfully"));
    } catch (err) {
      console.error("Failed to export:", err);
      toast.error(t("failedToExport"));
    }
  };

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
        <div className="w-full max-w-3xl flex flex-col items-center gap-8">
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
        <div className="w-full max-w-3xl mx-auto space-y-3">
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

      <div className="flex-1 min-h-0 max-w-3xl mx-auto w-full">
        <div className="flex flex-col h-full gap-3">
          <TranscriptionToolbar
            status={status}
            onNew={handleNewTranscription}
            onRetry={handleRetry}
            onCancel={handleCancel}
            onCopy={handleCopy}
            onExport={handleExport}
          />

          <ScrollArea className="flex-1 min-h-0 w-full rounded-md border">
            <div className="p-4 space-y-4">
              <SegmentList
                segments={segments}
                emptyMessage={
                  status === "transcribing"
                    ? t("transcriptionPlaceholderRealtime")
                    : t("transcriptionPlaceholder")
                }
                isCentiseconds={true}
                onSegmentChange={handleSegmentChange}
              />
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
