import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useTranslations } from "@workspace/i18n";
import { calculateFileHash, getAudioDuration } from "@workspace/ui/lib/utils";
import { useRecordings } from "@workspace/ui/hooks/use-recordings";
import { useTranscripts } from "@workspace/ui/hooks/use-transcripts";
import { useAuthStore } from "@workspace/ui/stores/auth-store";
import { useAudioStore } from "@workspace/ui/stores/audio-store";
import { useModelStore } from "@workspace/ui/stores/model-store";
import { useLanguageStore } from "@workspace/ui/stores/language-store";
import { useTranscriptionStore } from "@workspace/ui/stores/transcription-store";
import { useSummaryStore } from "@workspace/ui/stores/summary-store";
import { useWebTranscription } from "@workspace/ui/hooks/use-web-transcription";
import { Spinner } from "@workspace/ui/components/spinner";
import { Progress } from "@workspace/ui/components/progress";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { EmptyState } from "@workspace/ui/components/common/empty-state";
import { Ban, AlertCircle, Bug, RefreshCw, Home } from "lucide-react";
import { TranscriptionToolbar } from "@workspace/ui/components/transcription/transcription-toolbar";
import { SegmentList } from "@workspace/ui/components/transcription/segment-list";
import { TextShimmer } from "@workspace/ui/components/common/text-shimmer";
import { CircularProgress } from "@workspace/ui/components/common/circular-progress";
import { useRouter } from "@workspace/i18n/navigation";

interface WebTranscriptionViewProps {
  onSummarize?: () => void;
}

export const WebTranscriptionView = ({
  onSummarize,
}: WebTranscriptionViewProps) => {
  const router = useRouter();
  const t = useTranslations("TranscriptionView");

  const { getRecordingByHash, addRecording, deleteRecording } = useRecordings();
  const {
    addTranscript,
    getFirstTranscriptByRecordingId,
    updateTranscriptSegments,
  } = useTranscripts();

  const { selectedAudio, setSelectedAudio } = useAudioStore();
  const { selectedModel } = useModelStore();

  const {
    status,
    progress,
    segments,
    error,
    recordingId,
    setSegments,
    setTranscriptionState,
    clearTranscriptionState,
  } = useTranscriptionStore();

  const { resetSummary, setShowSideViews } = useSummaryStore();

  const { cancel: terminateWorker, transcribe } = useWebTranscription();

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
    if (!(selectedAudio instanceof File)) {
      toast.warning(t("fileNotFound"), {
        description: t("fileMovedOrDeleted"),
      });
      return;
    }

    try {
      if (recordingId) {
        await deleteRecording(recordingId);
      } else {
        const hash = await calculateFileHash(selectedAudio);

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
    setShowSideViews(false);
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

  const handleCancel = useCallback(async () => {
    if (status === "loadingModel" || status === "transcribing") {
      const wasRunning = terminateWorker();
      if (wasRunning) {
        const currentSegments = useTranscriptionStore.getState().segments;
        const currentProgress = useTranscriptionStore.getState().progress;
        const currentAudio = useAudioStore.getState().selectedAudio;
        const currentModel = useModelStore.getState().selectedModel;
        const currentLanguage = useLanguageStore.getState().language;

        setTranscriptionState({
          file:
            currentAudio instanceof File
              ? currentAudio.name
              : (currentAudio as string),
          model: currentModel as string,
          status: "cancelled",
          progress: currentProgress,
          segments: currentSegments,
          error: null,
        });

        toast.info(t("transcriptionCancelled"));

        if (currentSegments.length > 0 && currentAudio instanceof File) {
          const currentUserId = useAuthStore.getState().userId;

          if (currentUserId) {
            try {
              const hash = await calculateFileHash(currentAudio);
              let existingRecording = await getRecordingByHash(hash);
              let recordingId = existingRecording?.id;

              if (!recordingId) {
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
                  fileHash: hash,
                  duration: duration,
                  fileSize: currentAudio.size,
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
      }
    }
  }, [
    status,
    terminateWorker,
    setTranscriptionState,
    t,
    getRecordingByHash,
    addRecording,
    addTranscript,
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
            onClick: () => transcribe(),
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
        <CircularProgress
          value={progress}
          size={80}
          strokeWidth={5}
          showLabel
          labelClassName="text-sm font-mono"
          renderLabel={(p) => `${p.toFixed(0)}%`}
        />
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
