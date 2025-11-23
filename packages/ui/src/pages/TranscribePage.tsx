"use client";

import { useEffect, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";
import {
  Laptop,
  Upload,
  Computer,
  Smartphone,
  FileCodeIcon,
  FileAudioIcon,
} from "lucide-react";
import { toast } from "sonner";
import { generateSummary } from "@workspace/ui/lib/ai-client";
import { useTranslations } from "@workspace/i18n";
import { useRouter } from "@workspace/i18n/navigation";
import { useSidebar } from "@workspace/ui/components/sidebar";
import { useAudioStore } from "@workspace/ui/stores/audio-store";
import { useModelStore } from "@workspace/ui/stores/model-store";
import { useSummaryStore } from "@workspace/ui/stores/summary-store";
import { useTranscriptionStore } from "@workspace/ui/stores/transcription-store";
import { EmptyState } from "@workspace/ui/components/common/empty-state";
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
  const { segments } = useTranscriptionStore();
  const {
    setSummarizing,
    setSummaryResult,
    setError,
    showSideViews,
    setShowSideViews,
    model,
    url,
  } = useSummaryStore();
  const { isMobile } = useSidebar();
  const [isAndroid, setIsAndroid] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [activeTab, setActiveTab] = useState("transcribe");
  const selectionsMissing = !selectedAudio || !selectedModel;
  const TranscriptionView = isTauriApp
    ? NativeTranscriptionView
    : WebTranscriptionView;

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
      const result = await generateSummary(text, model, url);
      setSummaryResult(result);
      toast.success(t("summarySuccess"));
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : t("summaryFailed");
      setError(errorMessage);

      if (!isTauriApp && (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError"))) {
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
            label: t("returnToHome"),
            onClick: () => router.push("/"),
          }}
        />
      </div>
    );
  }

  // Show message if running on Android
  if (isAndroid) {
    return (
      <div className="flex flex-1 justify-center items-center p-6">
        <EmptyState
          title={t("androidSupportComingSoonTitle")}
          description={t("androidSupportComingSoonDesc")}
          icons={[Laptop, Smartphone, Computer]}
          action={{
            label: t("returnToHome"),
            onClick: () => router.push("/"),
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
