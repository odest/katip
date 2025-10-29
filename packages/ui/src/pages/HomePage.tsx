import { useTranslations } from "@workspace/i18n";
import { useRouter } from "@workspace/i18n/navigation";
import { Button } from "@workspace/ui/components/button";
import { AppFooter } from "@workspace/ui/components/layout/app-footer";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { AudioSelectCard } from "@workspace/ui/components/home/audio-select-card";
import { ModelSelectCard } from "@workspace/ui/components/home/model-select-card";
import { LanguageOptionsCard } from "@workspace/ui/components/home/language-options-card";
import { PerformanceOptionsCard } from "@workspace/ui/components/home/performance-options-card";
import { AdvancedOptionsCard } from "@workspace/ui/components/home/advanced-options-card";
import { useAudioStore } from "@workspace/ui/stores/audio-store";
import { useModelStore } from "@workspace/ui/stores/model-store";

export function HomePage() {
  const t = useTranslations("HomePage");
  const router = useRouter();
  const { selectedAudio } = useAudioStore();
  const { selectedModel } = useModelStore();
  const isButtonDisabled = !selectedAudio || !selectedModel;

  return (
    <>
      <ScrollArea className="overflow-y-auto w-full flex-1">
        <div className="flex flex-col gap-6 p-6">
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-center">{t("title")}</h1>
              <p className="text-muted-foreground text-center">
                {t("description")}
              </p>
            </div>
            <AudioSelectCard />
            <ModelSelectCard />
            <LanguageOptionsCard />
            <PerformanceOptionsCard />
            <AdvancedOptionsCard />
          </div>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
      <AppFooter>
        <Button
          size="lg"
          className="max-w-3xl mx-auto w-full shadow-lg"
          onClick={() => router.push("/transcribe")}
          disabled={isButtonDisabled}
        >
          {t("startTranscription")}
        </Button>
      </AppFooter>
    </>
  );
}
