import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { useTranslations } from "@workspace/i18n";

export function TranscribePage() {
  const t = useTranslations("TranscribePage");

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
