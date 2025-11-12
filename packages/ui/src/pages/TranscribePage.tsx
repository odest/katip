"use client";

import { useEffect, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";
import { useTranslations } from "@workspace/i18n";
import { useAudioStore } from "@workspace/ui/stores/audio-store";
import { useModelStore } from "@workspace/ui/stores/model-store";
import { NativeTranscriptionView } from "@workspace/ui/components/transcription/native-transcription-view";
import { WebTranscriptionView } from "@workspace/ui/components/transcription/web-transcription-view";
import { EmptyState } from "@workspace/ui/components/common/empty-state";
import {
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

  if (!isTauri()) {
    return (
      <div className="w-full h-full flex flex-col gap-4 overflow-y-auto">
        <WebTranscriptionView />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-y-auto">
      <NativeTranscriptionView />
    </div>
  );
}
