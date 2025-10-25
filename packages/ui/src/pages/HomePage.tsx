import { useTranslations } from "@workspace/i18n";
import { useRouter } from "@workspace/i18n/navigation";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { AudioSelectCard } from "@workspace/ui/components/common/audio-select-card";
import { ModelSelectCard } from "@workspace/ui/components/common/model-select-card";

export function HomePage() {
  const t = useTranslations("HomePage");
  const router = useRouter();

  return (
    <div className="relative w-full h-full">
      <ScrollArea className="overflow-y-auto w-full h-full">
        <div className="flex flex-1 flex-col gap-6 p-6 pb-32">
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-center">{t("title")}</h1>
              <p className="text-muted-foreground text-center">
                {t("description")}
              </p>
            </div>
            <AudioSelectCard />
            <ModelSelectCard />
          </div>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      <div className="absolute bottom-0 left-0 right-0 flex justify-center p-16">
        <Button
          size="lg"
          className="w-full max-w-3xl shadow-lg cursor-pointer"
          onClick={() => router.push("/transcribe")}
        >
          {t("startTranscription")}
        </Button>
      </div>
    </div>
  );
}
