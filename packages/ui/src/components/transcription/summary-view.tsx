import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { isTauri } from "@tauri-apps/api/core";
import { AlertCircle, Copy } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "@workspace/i18n";
import { useSummaryStore } from "@workspace/ui/stores/summary-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { TextShimmer } from "@workspace/ui/components/common/text-shimmer";

export const SummaryView = () => {
  const t = useTranslations("SummaryView");
  const { error, isSummarizing, summaryResult } = useSummaryStore();

  const handleCopy = async () => {
    if (!summaryResult?.summary) return;
    try {
      if (isTauri()) {
        await writeText(summaryResult.summary);
      } else {
        await navigator.clipboard.writeText(summaryResult.summary);
      }
      toast.success(t("copiedToClipboard"));
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error(t("failedToCopy"));
    }
  };

  return (
    <div className="flex flex-col h-full w-full pt-6 pr-6">
      <Card className="flex flex-1 min-h-0 max-w-3xl mx-auto w-full rounded-md pt-3 gap-3 shadow-none">
        <CardHeader className="h-8 border-b p-0">
          <div className="relative flex h-full items-center px-4 pt-0.5">
            <CardTitle className="leading-none">{t("title")}</CardTitle>
            {summaryResult?.summary && (
              <div className="absolute right-1 top-1/2 -translate-y-1/2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="size-8"
                      onClick={handleCopy}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("copy")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
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
