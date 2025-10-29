"use client";

import { useEffect, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";
import { useTranslations } from "@workspace/i18n";
import { useAudioStore } from "@workspace/ui/stores/audio-store";
import { useModelStore } from "@workspace/ui/stores/model-store";
import { StatusMessage } from "@workspace/ui/components/common/status-message";

export function TranscribePage() {
  const t = useTranslations("TranscribePage");
  const { selectedAudio } = useAudioStore();
  const { selectedModel } = useModelStore();
  const [isAndroid, setIsAndroid] = useState(false);

  const selectionsMissing = !selectedAudio || !selectedModel;

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
      <StatusMessage
        title={t("configurationRequiredTitle")}
        description={t("configurationRequiredDesc")}
        buttonText={t("returnToHome")}
      />
    );
  }

  // Show message if running on web browser
  if (!isTauri()) {
    return (
      <StatusMessage
        title={t("webSupportComingSoonTitle")}
        description={t("webSupportComingSoonDesc")}
        buttonText={t("returnToHome")}
      />
    );
  }

  // Show message if running on Android
  if (isAndroid) {
    return (
      <StatusMessage
        title={t("androidSupportComingSoonTitle")}
        description={t("androidSupportComingSoonDesc")}
        buttonText={t("returnToHome")}
      />
    );
  }

  // Show the actual transcription interface
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 p-6">
      <div className="flex flex-col items-center text-center gap-6">
        <h1 className="text-2xl leading-none font-semibold text-center">
          {t("readyToTranscribeTitle")}
        </h1>
        <p className="max-w-lg text-muted-foreground text-center">
          {t("readyToTranscribeDesc")}
        </p>
      </div>
    </div>
  );
}
