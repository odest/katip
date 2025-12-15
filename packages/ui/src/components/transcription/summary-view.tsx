import { AlertCircle } from "lucide-react";
import { useTranslations } from "@workspace/i18n";
import { useSummaryStore } from "@workspace/ui/stores/summary-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { TextShimmer } from "@workspace/ui/components/common/text-shimmer";

export const SummaryView = () => {
  const t = useTranslations("SummaryView");
  const { error, isSummarizing, summaryResult } = useSummaryStore();

  return (
    <div className="flex flex-col h-full w-full pt-6 pr-6">
      <Card className="flex flex-1 min-h-0 max-w-3xl mx-auto w-full rounded-md pt-3 gap-3 shadow-none">
        <CardHeader className="h-8 border-b">
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center flex-1 min-h-0 p-0">
          {isSummarizing ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center">
              <TextShimmer className="font-mono text-sm" duration={1}>
                {t("message")}
              </TextShimmer>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : !summaryResult?.summary ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center">
              <p className="text-muted-foreground text-sm">
                {t("noSummaryAvailable")}
              </p>
            </div>
          ) : (
            <ScrollArea className="flex-1 min-h-0 w-full">
              <div className="flex flex-col gap-3 p-6 pt-2">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {summaryResult.summary}
                </p>
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
