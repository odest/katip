"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { platform } from "@tauri-apps/plugin-os";
import { isTauri, invoke } from "@tauri-apps/api/core";
import {
  Home,
  Laptop,
  Upload,
  Computer,
  Smartphone,
  FileCodeIcon,
  FileAudioIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "@workspace/i18n";
import { useRouter } from "@workspace/i18n/navigation";
import { calculateFileHash } from "@workspace/ui/lib/utils";
import { generateSummary } from "@workspace/ui/lib/ai-client";
import { useSidebar } from "@workspace/ui/components/sidebar";
import { useAuthStore } from "@workspace/ui/stores/auth-store";
import { useAudioStore } from "@workspace/ui/stores/audio-store";
import { useModelStore } from "@workspace/ui/stores/model-store";
import { useSummaries } from "@workspace/ui/hooks/use-summaries";
import { useRecordings } from "@workspace/ui/hooks/use-recordings";
import { useTranscripts } from "@workspace/ui/hooks/use-transcripts";
import { useActionItems } from "@workspace/ui/hooks/use-action-items";
import { useLanguageStore } from "@workspace/ui/stores/language-store";
import { useSummaryStore } from "@workspace/ui/stores/summary-store";
import { EmptyState } from "@workspace/ui/components/common/empty-state";
import { useTranscriptionStore } from "@workspace/ui/stores/transcription-store";
import { MobileLayout } from "@workspace/ui/components/transcription/mobile-layout";
import { DesktopLayout } from "@workspace/ui/components/transcription/desktop-layout";
import { WebTranscriptionView } from "@workspace/ui/components/transcription/web-transcription-view";
import { NativeTranscriptionView } from "@workspace/ui/components/transcription/native-transcription-view";

export function TranscribePage() {
  const router = useRouter();
  const isTauriApp = isTauri();
  const t = useTranslations("TranscribePage");
  const { selectedAudio } = useAudioStore();
  const { selectedModel } = useModelStore();
  const { segments, recordingId } = useTranscriptionStore();
  const {
    setSummarizing,
    setSummaryResult,
    setError,
    showSideViews,
    setShowSideViews,
    model,
    provider,
    url,
    apiKey,
  } = useSummaryStore();
  const { language } = useLanguageStore();
  const { userId } = useAuthStore.getState();
  const { addActionItems } = useActionItems();
  const { getRecordingByHash, getRecordingById } = useRecordings();
  const { getTranscriptByRecordingId } = useTranscripts();
  const { addSummary, deleteSummaryByRecordingId } = useSummaries();
  const { isMobile } = useSidebar();
  const [isAndroid, setIsAndroid] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [activeTab, setActiveTab] = useState("transcribe");
  const selectionsMissing = recordingId
    ? false
    : !selectedAudio || !selectedModel;
  const TranscriptionView =
    isTauriApp && !isAndroid ? NativeTranscriptionView : WebTranscriptionView;

  useEffect(() => {
    if (showSideViews) {
      const timer = setTimeout(() => {
        setAnimateIn(true);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
    }
  }, [showSideViews]);

  useEffect(() => {
    if (isTauriApp) {
      const checkPlatform = async () => {
        try {
          const platformType = await platform();
          setIsAndroid(platformType === "android");
        } catch (err) {
          console.error("Error detecting platform:", err);
        }
      };
      checkPlatform();
    }
  }, [isTauriApp]);

  const handleSummarize = async () => {
    const text = segments.map((s) => s.text).join(" ");
    if (!text.trim()) {
      toast.error(t("noTextToSummarize"));
      return;
    }

    setSummarizing(true);
    setError(null);
    setShowSideViews(true);
    setActiveTab("summary");

    try {
      const result = await generateSummary(text, model, url, provider, apiKey);
      setSummaryResult(result);

      try {
        let recording = null;

        if (recordingId) {
          recording = await getRecordingById(recordingId);
        } else {
          let hash = "";
          if (isTauriApp && typeof selectedAudio === "string") {
            hash = await invoke<string>("calculate_file_hash", {
              path: selectedAudio,
            });
          } else if (selectedAudio instanceof File) {
            hash = await calculateFileHash(selectedAudio);
          }

          if (hash) {
            recording = await getRecordingByHash(hash);
          }
        }

        if (recording && userId) {
          const transcript = await getTranscriptByRecordingId(
            recording.id,
            selectedModel as string,
            language
          );

          await deleteSummaryByRecordingId(recording.id);

          const summaryId = uuidv4();
          await addSummary({
            id: summaryId,
            recordingId: recording.id,
            transcriptId: transcript?.id,
            userId,
            content: result.summary,
            provider: provider,
            model: model,
            createdAt: new Date(),
          });

          if (result.action_items && result.action_items.length > 0) {
            await addActionItems(
              result.action_items.map((item) => ({
                id: uuidv4(),
                summaryId,
                recordingId: recording.id,
                userId,
                task: item.task,
                assignee: item.assignee,
                isCompleted: item.completed,
                priority: item.priority,
                createdAt: new Date(),
              }))
            );
          }
        }
      } catch (dbError) {
        console.error("Failed to save summary to database:", dbError);
      }

      toast.success(t("summarySuccess"));
    } catch (err) {
      console.error(err);
      const errorMessage =
        err instanceof Error ? err.message : t("summaryFailed");
      setError(errorMessage);

      if (
        !isTauriApp &&
        (errorMessage.includes("Failed to fetch") ||
          errorMessage.includes("NetworkError"))
      ) {
        toast.error(t("summaryFailedOllamaCORS"));
      } else {
        toast.error(t("summaryFailedCheckConnection"));
      }
    } finally {
      setSummarizing(false);
    }
  };

  // Show message if selections are missing
  if (selectionsMissing) {
    return (
      <div className="flex flex-1 justify-center items-center p-6">
        <EmptyState
          title={t("configurationRequiredTitle")}
          description={t("configurationRequiredDesc")}
          icons={[FileAudioIcon, Upload, FileCodeIcon]}
          action={{
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

  if (isMobile || !showSideViews) {
    return (
      <MobileLayout
        showSideViews={showSideViews}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        TranscriptionView={TranscriptionView}
        onSummarize={handleSummarize}
      />
    );
  }

  return (
    <DesktopLayout
      animateIn={animateIn}
      TranscriptionView={TranscriptionView}
      onSummarize={handleSummarize}
    />
  );
}
