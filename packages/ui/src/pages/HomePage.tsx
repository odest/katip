import { useTranslations } from "@workspace/i18n";
import { useRouter } from "@workspace/i18n/navigation";
import { Button } from "@workspace/ui/components/button";
import { AppFooter } from "@workspace/ui/components/layout/app-footer";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { AudioSelectCard } from "@workspace/ui/components/common/audio-select-card";
import { ModelSelectCard } from "@workspace/ui/components/common/model-select-card";
import { LanguageSelectCard } from "@workspace/ui/components/common/language-select-card";
import { PerformanceSelectCard } from "@workspace/ui/components/common/performance-select-card";

export function HomePage() {
  const t = useTranslations("HomePage");
  const router = useRouter();

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
            <LanguageSelectCard />
            <PerformanceSelectCard />
          </div>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
      <AppFooter>
        <Button
          size="lg"
          className="max-w-3xl mx-auto w-full shadow-lg cursor-pointer"
          onClick={() => router.push("/transcribe")}
        >
          {t("startTranscription")}
        </Button>
      </AppFooter>
    </>
  );
}
