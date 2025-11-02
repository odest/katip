"use client";

import { useEffect, useState, useRef } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";
import { useTranslations } from "@workspace/i18n";
import { useAudioStore } from "@workspace/ui/stores/audio-store";
import { useModelStore } from "@workspace/ui/stores/model-store";
import {
  useTranscriptionStore,
  TranscriptionStatus,
} from "@workspace/ui/stores/transcription-store";
import {
  TranscriptionView,
  TranscriptionViewHandle,
} from "@workspace/ui/components/transcription/transcription-view";
import { EmptyState } from "@workspace/ui/components/common/empty-state";
import { AppFooter } from "@workspace/ui/components/layout/app-footer";
import { Button } from "@workspace/ui/components/button";
import {
  Earth,
  Laptop,
  Upload,
  Computer,
  Smartphone,
  FileCodeIcon,
  FileAudioIcon,
} from "lucide-react";
import { useRouter } from "@workspace/i18n/navigation";

export function TranscribePage() {
  const router = useRouter();
  const t = useTranslations("TranscribePage");
  const { selectedAudio } = useAudioStore();
  const { selectedModel } = useModelStore();
  const { checkTranscriptionMatch, clearTranscriptionState } =
    useTranscriptionStore();
  const [isAndroid, setIsAndroid] = useState(false);
  const [currentStatus, setCurrentStatus] =
    useState<TranscriptionStatus | null>(null);

  const transcriptionViewRef = useRef<TranscriptionViewHandle>(null);

  const selectionsMissing = !selectedAudio || !selectedModel;

  const transcriptionState = checkTranscriptionMatch(
    selectedAudio as string,
    selectedModel as string
  );

  const isProcessing =
    currentStatus === "loadingModel" ||
    currentStatus === "transcribing" ||
    (!currentStatus &&
      (transcriptionState?.status === "loadingModel" ||
        transcriptionState?.status === "transcribing"));

  const handleNewTranscription = () => {
    clearTranscriptionState();
    router.push("/");
  };

  const handleRetry = () => {
    clearTranscriptionState();
    if (transcriptionViewRef.current) {
      transcriptionViewRef.current.retryTranscription();
    }
  };

  const handleCancel = async () => {
    if (transcriptionViewRef.current) {
      await transcriptionViewRef.current.cancelTranscription();
    }
  };

  useEffect(() => {
    if (isTauri()) {
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
  }, []);

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

  // Show message if running on web browser
  if (!isTauri()) {
    return (
      <div className="flex flex-1 justify-center items-center p-6">
        <EmptyState
          title={t("webSupportComingSoonTitle")}
          description={t("webSupportComingSoonDesc")}
          icons={[Laptop, Earth, Computer]}
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

  // Show the actual transcription interface
  return (
    <>
      <div className="w-full h-full flex flex-col p-6 gap-4 overflow-y-auto">
        <TranscriptionView
          ref={transcriptionViewRef}
          onStatusChange={setCurrentStatus}
        />
      </div>

      <AppFooter>
        {isProcessing ? (
          <Button
            size="lg"
            variant="destructive"
            className="max-w-3xl mx-auto w-full shadow-lg"
            onClick={handleCancel}
          >
            {t("cancelTranscription")}
          </Button>
        ) : (
          <div className="max-w-3xl mx-auto w-full flex gap-3">
            <Button
              size="lg"
              variant="outline"
              className="flex-1 shadow-lg"
              onClick={handleNewTranscription}
            >
              {t("newTranscription")}
            </Button>
            <Button
              size="lg"
              className="flex-1 shadow-lg"
              onClick={handleRetry}
            >
              {t("retryTranscription")}
            </Button>
          </div>
        )}
      </AppFooter>
    </>
  );
}
