import { useTranslations } from "@workspace/i18n";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { FileUploadCard } from "@workspace/ui/components/common/file-upload-card";
import { ModelSelectCard } from "@workspace/ui/components/common/model-select-card";

export function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <ScrollArea className="overflow-y-auto w-full">
      <div className="flex flex-1 flex-col gap-6 p-6 ">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-center">{t("title")}</h1>
            <p className="text-muted-foreground text-center">
              {t("description")}
            </p>
          </div>
          <FileUploadCard />
          <ModelSelectCard />
        </div>
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
