import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useTranslations } from "@workspace/i18n";
import { calculateFileHash } from "@workspace/ui/lib/utils";
import { useRecordings } from "@workspace/ui/hooks/use-recordings";
import { useTranscripts } from "@workspace/ui/hooks/use-transcripts";
import { useAudioStore } from "@workspace/ui/stores/audio-store";
import { useModelStore } from "@workspace/ui/stores/model-store";
import { useLanguageStore } from "@workspace/ui/stores/language-store";
import {
  useTranscriptionStore,
  TranscriptionStatus,
  Segment,
} from "@workspace/ui/stores/transcription-store";
import { useSummaryStore } from "@workspace/ui/stores/summary-store";
import { useWebTranscription } from "@workspace/ui/hooks/use-web-transcription";
import { Progress } from "@workspace/ui/components/progress";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { EmptyState } from "@workspace/ui/components/common/empty-state";
import { Ban, AlertCircle, Bug } from "lucide-react";
import { TranscriptionToolbar } from "@workspace/ui/components/transcription/transcription-toolbar";
import { SegmentList } from "@workspace/ui/components/transcription/segment-list";
import { useRouter } from "@workspace/i18n/navigation";

interface WebTranscriptionViewProps {
  onSummarize?: () => void;
}

export const WebTranscriptionView = ({
  onSummarize,
}: WebTranscriptionViewProps) => {
  const router = useRouter();
  const t = useTranslations("TranscriptionView");

  const { getRecordingByHash } = useRecordings();
  const { deleteTranscriptByRecordingId } = useTranscripts();

  const { selectedAudio } = useAudioStore();
  const { selectedModel } = useModelStore();
  const {
    checkTranscriptionMatch,
    setTranscriptionState,
    clearTranscriptionState,
  } = useTranscriptionStore();
  const { resetSummary } = useSummaryStore();

  const initialState = useMemo(
    () =>
      checkTranscriptionMatch(
        selectedAudio as string,
        selectedModel as string
      ) || null,
    [selectedAudio, selectedModel, checkTranscriptionMatch]
  );

  const [status, setStatus] = useState<TranscriptionStatus | "cancelled">(
    initialState?.status || "loadingModel"
  );
  const [progress, setProgress] = useState(initialState?.progress || 0);
  const [segments, setSegments] = useState<Segment[]>(
    initialState?.segments || []
  );
  const [error, setError] = useState<string | null>(
    initialState?.error || null
  );
  const [downloadingFiles, setDownloadingFiles] = useState<
    Array<{ name: string; progress: number; status: "loading" | "done" }>
  >([]);
  const isTranscribing = status === "transcribing";

  const handleSegmentChange = (index: number, newText: string) => {
    setSegments((prevSegments) => {
      const newSegments = [...prevSegments];
      newSegments[index] = { ...newSegments[index]!, text: newText };
      return newSegments;
    });
  };

  const handleNewTranscription = () => {
    clearTranscriptionState();
    resetSummary();
    router.push("/");
  };

  const handleRetry = async () => {
    try {
      if (selectedAudio && selectedModel) {
        let hash = "";
        if (selectedAudio instanceof File) {
          hash = await calculateFileHash(selectedAudio);
        }

        if (hash) {
          const recording = await getRecordingByHash(hash);
          if (recording) {
            const { language } = useLanguageStore.getState();
            await deleteTranscriptByRecordingId(
              recording.id,
              selectedModel as string,
              language
            );
          }
        }
      }
    } catch (error) {
      console.error("Failed to delete transcript on retry:", error);
    }

    clearTranscriptionState();
    resetSummary();
    transcribe();
  };

  const handleCopy = async () => {
    try {
      const text = segments.map((segment) => segment.text).join("\n");
      await navigator.clipboard.writeText(text);
      toast.success(t("copiedToClipboard"));
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error(t("failedToCopyToClipboard"));
    }
  };

  const handleExport = () => {
    try {
      const text = segments.map((segment) => segment.text).join("\n");
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "transcription.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(t("exportedSuccessfully"));
    } catch (err) {
      console.error("Failed to export:", err);
      toast.error(t("failedToExport"));
    }
  };

  const { cancel: terminateWorker, transcribe } = useWebTranscription({
    initialState,
    setStatus,
    setProgress,
    setSegments,
    setError,
    setTranscriptionState,
    setDownloadingFiles,
  });

  const handleCancel = useCallback(() => {
    if (status === "loadingModel" || status === "transcribing") {
      const wasRunning = terminateWorker();
      if (wasRunning) {
        setTranscriptionState({
          file: selectedAudio as string,
          model: selectedModel as string,
          status: "cancelled" as TranscriptionStatus,
          progress: progress,
          segments: segments,
          error: null,
        });
        setStatus("cancelled");
        toast.info(t("transcriptionCancelled"));
      }
    }
  }, [
    status,
    progress,
    segments,
    terminateWorker,
    setTranscriptionState,
    selectedAudio,
    selectedModel,
    t,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (status === "loadingModel" || status === "transcribing") {
        const message = t("unsavedChangesWarning");
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [status, t]);

  useEffect(() => {
    return () => {
      if (status === "loadingModel" || status === "transcribing") {
        setTranscriptionState({
          file: selectedAudio as string,
          model: selectedModel as string,
          status: "cancelled" as TranscriptionStatus,
          progress: progress,
          segments: segments,
          error: null,
        });
      }
    };
  }, [
    status,
    progress,
    segments,
    selectedAudio,
    selectedModel,
    setTranscriptionState,
  ]);

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
            onClick: () => transcribe(),
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
            <p className="text-sm text-muted-foreground">
              {t("downloadingFromCDN")}
            </p>
          </div>
          <div className="w-full space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">{t("overall")}</span>
              <span className="font-medium">{progress.toFixed(0)}%</span>
            </div>
            <ScrollArea className="h-[200px] w-full rounded-md border">
              <div className="space-y-2 p-2">
                {downloadingFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50"
                  >
                    <span className="text-muted-foreground truncate flex-1 mr-2">
                      {file.name}
                    </span>
                    <span
                      className={`font-medium whitespace-nowrap ${
                        file.status === "done" ? "text-green-500" : ""
                      }`}
                    >
                      {file.status === "done"
                        ? t("done")
                        : `${t("loading")} ${file.progress.toFixed(0)}%`}
                    </span>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full gap-4 p-6">
      {isTranscribing && (
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
                isCentiseconds={false}
                onSegmentChange={handleSegmentChange}
              />
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
