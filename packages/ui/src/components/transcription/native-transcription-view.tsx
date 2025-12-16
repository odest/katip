import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile, exists } from "@tauri-apps/plugin-fs";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { toast } from "sonner";
import { useTranslations } from "@workspace/i18n";
import { useRecordings } from "@workspace/ui/hooks/use-recordings";
import { useTranscripts } from "@workspace/ui/hooks/use-transcripts";
import { useAudioStore } from "@workspace/ui/stores/audio-store";
import { useModelStore } from "@workspace/ui/stores/model-store";
import { useLanguageStore } from "@workspace/ui/stores/language-store";
import { useTranscriptionStore } from "@workspace/ui/stores/transcription-store";
import { useSummaryStore } from "@workspace/ui/stores/summary-store";
import { Spinner } from "@workspace/ui/components/spinner";
import { Progress } from "@workspace/ui/components/progress";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { EmptyState } from "@workspace/ui/components/common/empty-state";
import { Ban, AlertCircle, Bug, RefreshCw, Home } from "lucide-react";
import { useTranscriptionProcess } from "@workspace/ui/hooks/use-native-transcription";
import { TranscriptionToolbar } from "@workspace/ui/components/transcription/transcription-toolbar";
import { SegmentList } from "@workspace/ui/components/transcription/segment-list";
import { TextShimmer } from "@workspace/ui/components/common/text-shimmer";
import { useRouter } from "@workspace/i18n/navigation";

interface NativeTranscriptionViewProps {
  onSummarize?: () => void;
}

export const NativeTranscriptionView = ({
  onSummarize,
}: NativeTranscriptionViewProps) => {
  const router = useRouter();
  const t = useTranslations("TranscriptionView");

  const { getRecordingByHash, deleteRecording } = useRecordings();
  const { getFirstTranscriptByRecordingId, updateTranscriptSegments } =
    useTranscripts();

  const { selectedAudio, setSelectedAudio } = useAudioStore();
  const { selectedModel } = useModelStore();

  const {
    status,
    progress,
    segments,
    error,
    recordingId,
    setSegments,
    clearTranscriptionState,
  } = useTranscriptionStore();

  const { resetSummary } = useSummaryStore();

  const { resetAndRestart } = useTranscriptionProcess();

  const handleSegmentChange = async (index: number, newText: string) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index]!, text: newText };
    setSegments(newSegments);

    if (recordingId) {
      const transcript = await getFirstTranscriptByRecordingId(recordingId);
      if (transcript) {
        await updateTranscriptSegments(transcript.id, newSegments);
      }
    }
  };

  const handleNewTranscription = () => {
    clearTranscriptionState();
    resetSummary();
    setSelectedAudio(null);
    router.push("/home");
  };

  const handleRetry = async () => {
    const fileExists =
      selectedAudio &&
      typeof selectedAudio === "string" &&
      (await exists(selectedAudio));
    if (!fileExists) {
      toast.warning(t("fileNotFound"), {
        description: t("fileMovedOrDeleted"),
      });
      return;
    }

    try {
      await invoke("cancel_transcription");
    } catch (error) {
      // Ignore error if no transcription is running
    }

    try {
      if (recordingId) {
        await deleteRecording(recordingId);
      } else if (selectedAudio && typeof selectedAudio === "string") {
        const hash = await invoke<string>("calculate_file_hash", {
          path: selectedAudio,
        });

        if (hash) {
          const recording = await getRecordingByHash(hash);
          if (recording) {
            await deleteRecording(recording.id);
          }
        }
      }
    } catch (error) {
      console.error("Failed to delete recording on retry:", error);
    }

    // Clear localStorage directly to avoid async persist issues
    localStorage.removeItem("transcription-storage");
    localStorage.removeItem("summary-storage");
    resetAndRestart();
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

  if (status === "error") {
    return (
      <div className="flex flex-1 justify-center items-center p-6">
        <EmptyState
          title={t("transcriptionFailed")}
          description={error || t("transcriptionFailedDesc")}
          className="border-destructive hover:border-destructive/80"
          icons={[Ban, AlertCircle, Bug]}
          action={{
            label: (
              <>
                <RefreshCw />
                {t("tryAgain")}
              </>
            ),
            onClick: () => window.location.reload(),
          }}
          secondaryAction={{
            label: (
              <>
                <Home />
                {t("returnToHome")}
              </>
            ),
            onClick: () => router.push("/home"),
          }}
        />
      </div>
    );
  }

  if (status === "queued" || status === "processingAudio") {
    return (
      <div className="flex flex-1 flex-col justify-center items-center p-6 gap-4">
        <Spinner className="size-8" />
        <h2 className="text-2xl font-bold">{t("preparingFile")}</h2>
        <TextShimmer className="font-mono" duration={1}>
          {t("decodingAndResampling")}
        </TextShimmer>
      </div>
    );
  }

  if (status === "loadingModel") {
    return (
      <div className="flex flex-1 flex-col justify-center items-center p-6 gap-4">
        <Spinner className="size-8" />
        <h2 className="text-2xl font-bold">{t("loadingModel")}</h2>
        <TextShimmer className="font-mono" duration={1}>
          {t("preparingModel")}
        </TextShimmer>
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
            onSummarize={onSummarize}
          />

          <ScrollArea className="flex-1 min-h-0 w-full rounded-md border bg-card">
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
