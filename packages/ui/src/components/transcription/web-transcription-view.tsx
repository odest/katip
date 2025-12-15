import { useEffect, useState, useCallback } from "react";
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
import {
  useTranscriptionStore,
  TranscriptionStatus,
  Segment,
} from "@workspace/ui/stores/transcription-store";
import { useSummaryStore } from "@workspace/ui/stores/summary-store";
import { useWebTranscription } from "@workspace/ui/hooks/use-web-transcription";
import { Spinner } from "@workspace/ui/components/spinner";
import { Progress } from "@workspace/ui/components/progress";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
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

  const { getRecordingByHash, addRecording } = useRecordings();
  const { deleteTranscriptByRecordingId, addTranscript } = useTranscripts();

  const { language } = useLanguageStore();
  const { selectedAudio, setSelectedAudio } = useAudioStore();
  const { selectedModel } = useModelStore();
  const {
    status: storeStatus,
    progress: storeProgress,
    segments: storeSegments,
    error: storeError,
    file: storeFile,
    model: storeModel,
    recordingId: storeRecordingId,
    setTranscriptionState,
    clearTranscriptionState,
  } = useTranscriptionStore();
  const { resetSummary } = useSummaryStore();

  const isActiveTranscription =
    storeFile ===
      (selectedAudio instanceof File ? selectedAudio.name : selectedAudio) &&
    storeModel === selectedModel &&
    (storeStatus === "processingAudio" ||
      storeStatus === "loadingModel" ||
      storeStatus === "transcribing");

  const [status, setStatus] = useState<TranscriptionStatus>(
    isActiveTranscription ? storeStatus : "processingAudio"
  );
  const [progress, setProgress] = useState(
    isActiveTranscription ? storeProgress : 0
  );
  const [segments, setSegments] = useState<Segment[]>(
    isActiveTranscription ? storeSegments : []
  );
  const [error, setError] = useState<string | null>(
    isActiveTranscription ? storeError : null
  );
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
    setSelectedAudio(null);
    router.push("/home");
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
    isActiveTranscription,
    storeRecordingId,
    setStatus,
    setProgress,
    setSegments,
    setError,
    setTranscriptionState,
  });

  const handleCancel = useCallback(async () => {
    if (status === "loadingModel" || status === "transcribing") {
      const wasRunning = terminateWorker();
      if (wasRunning) {
        const currentSegments = segments;
        const currentProgress = progress;

        setTranscriptionState({
          file:
            selectedAudio instanceof File
              ? selectedAudio.name
              : (selectedAudio as string),
          model: selectedModel as string,
          status: "cancelled" as TranscriptionStatus,
          progress: currentProgress,
          segments: currentSegments,
          error: null,
        });
        setStatus("cancelled");
        toast.info(t("transcriptionCancelled"));

        if (currentSegments.length > 0 && selectedAudio instanceof File) {
          const currentUserId = useAuthStore.getState().userId;

          if (currentUserId) {
            try {
              const hash = await calculateFileHash(selectedAudio);
              let existingRecording = await getRecordingByHash(hash);
              let recordingId = existingRecording?.id;

              if (!recordingId) {
                const duration = await getAudioDuration(
                  URL.createObjectURL(selectedAudio)
                );
                recordingId = uuidv4();

                await addRecording({
                  id: recordingId,
                  userId: currentUserId,
                  title: selectedAudio.name || "Untitled",
                  description: null,
                  filePath: selectedAudio.name,
                  fileHash: hash,
                  duration: duration,
                  fileSize: selectedAudio.size,
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
                  language: language,
                  model: selectedModel as string,
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
    progress,
    segments,
    terminateWorker,
    setTranscriptionState,
    selectedAudio,
    selectedModel,
    language,
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

  useEffect(() => {
    return () => {
      if (status === "loadingModel" || status === "transcribing") {
        setTranscriptionState({
          file: selectedAudio as string,
          model: selectedModel as string,
          status: "processing" as TranscriptionStatus,
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

  if (status === "processingAudio") {
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
