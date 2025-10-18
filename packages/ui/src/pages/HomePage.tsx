import { AudioFilePicker } from "@workspace/ui/components/common/audio-file-picker";
import { useTranslations } from "@workspace/i18n";

export function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <div className="flex flex-col flex-1 justify-center items-center space-y-4">
      <h1 className="text-2xl font-bold mb-10">{t("title")}</h1>
      <AudioFilePicker />
    </div>
  );
}
