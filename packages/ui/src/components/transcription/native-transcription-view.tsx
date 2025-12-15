import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { toast } from "sonner";
import { useTranslations } from "@workspace/i18n";
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

  const { getRecordingByHash } = useRecordings();
  const { deleteTranscriptByRecordingId } = useTranscripts();

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
    storeFile === selectedAudio &&
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
        if (typeof selectedAudio === "string") {
          hash = await invoke<string>("calculate_file_hash", {
            path: selectedAudio,
          });
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
    isActiveTranscription,
    storeRecordingId,
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
