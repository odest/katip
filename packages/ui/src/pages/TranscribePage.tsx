"use client";

import { useEffect } from "react";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { useTranslations } from "@workspace/i18n";
import { useAudioStore } from "@workspace/ui/stores/audio-store";
import { useModelStore } from "@workspace/ui/stores/model-store";
import { useLanguageStore } from "@workspace/ui/stores/language-store";
import { usePerformanceStore } from "@workspace/ui/stores/performance-store";

export function TranscribePage() {
  const t = useTranslations("TranscribePage");
  const { audioFile } = useAudioStore();
  const { modelFile, modelPath, selectedModelName } = useModelStore();
  const { language, translateToEnglish } = useLanguageStore();
  const { useGPU, threadCount } = usePerformanceStore();

  // Debugging: Log selected settings whenever they change
  useEffect(() => {
    console.log("=== Transcribe Page - Selected Settings ===");
    console.log("Audio File:", audioFile);
    console.log("Model File (Web):", modelFile);
    console.log("Model Path (Desktop):", modelPath);
    console.log("Selected Model Name:", selectedModelName);
    console.log("Language:", language);
    console.log("Translate to English:", translateToEnglish);
    console.log("Use GPU:", useGPU);
    console.log("Thread Count:", threadCount);
    console.log("==========================================");
  }, [
    audioFile,
    modelFile,
    modelPath,
    selectedModelName,
    language,
    translateToEnglish,
    useGPU,
    threadCount,
  ]);

  return (
    <ScrollArea className="overflow-y-auto w-full">
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-center">{t("title")}</h1>
            <p className="text-muted-foreground text-center">
              {t("description")}
            </p>
          </div>
        </div>
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
