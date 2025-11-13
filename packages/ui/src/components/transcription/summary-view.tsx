import { useTranslations } from "@workspace/i18n";
import { TextShimmer } from "@workspace/ui/components/common/text-shimmer";

export const SummaryView = () => {
  const t = useTranslations("SummaryView");
  return (
    <div className="flex flex-col h-full w-full pt-6 pr-6">
      <div className="flex flex-1 justify-center items-center min-h-0 max-w-3xl mx-auto w-full rounded-md border ">
        <TextShimmer className="font-mono text-sm" duration={1}>
          {t("message")}
        </TextShimmer>
      </div>
    </div>
  );
};
