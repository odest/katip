import { isTauri } from "@tauri-apps/api/core";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { AlertCircle, Copy, User } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "@workspace/i18n";
import { cn } from "@workspace/ui/lib/utils";
import { getBadgeStyles } from "@workspace/ui/lib/utils";
import { useSummaryStore } from "@workspace/ui/stores/summary-store";
import { useActionItems } from "@workspace/ui/hooks/use-action-items";
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
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { TextShimmer } from "@workspace/ui/components/common/text-shimmer";

export const ActionsView = () => {
  const t = useTranslations("ActionsView");
  const { error, isSummarizing, summaryResult, toggleActionItem } =
    useSummaryStore();
  const { updateActionItemCompleted } = useActionItems();

  const handleToggle = async (index: number) => {
    const item = summaryResult?.action_items[index];
    if (!item) return;

    toggleActionItem(index);

    if (item.id) {
      await updateActionItemCompleted(item.id, !item.completed);
    }
  };

  const handleCopy = async () => {
    if (!summaryResult?.action_items?.length) return;
    try {
      const text = summaryResult.action_items
        .map((item, index) => {
          const status = item.completed ? "[x]" : "[ ]";
          const priority = item.priority ? ` (${item.priority})` : "";
          const assignee =
            item.assignee && item.assignee.toLowerCase() !== "unassigned"
              ? ` - ${item.assignee}`
              : "";
          return `${status} ${index + 1}. ${item.task}${priority}${assignee}`;
        })
        .join("\n");
      if (isTauri()) {
        await writeText(text);
      } else {
        await navigator.clipboard.writeText(text);
      }
      toast.success(t("copiedToClipboard"));
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error(t("failedToCopy"));
    }
  };

  return (
    <div className="flex flex-col h-full w-full pt-6 pb-6 pr-6">
      <Card className="flex flex-1 min-h-0 max-w-3xl mx-auto w-full rounded-md pt-3 gap-3 shadow-none">
        <CardHeader className="h-8 border-b p-0">
          <div className="relative flex h-full items-center px-4 pt-0.5">
            <CardTitle className="leading-none">{t("title")}</CardTitle>
            {(summaryResult?.action_items?.length ?? 0) > 0 && (
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
          ) : !summaryResult || summaryResult.action_items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center">
              <p className="text-muted-foreground text-sm">
                {t("noActionsAvailable")}
              </p>
            </div>
          ) : (
            <ScrollArea className="flex-1 min-h-0 w-full">
              <div className="flex flex-col gap-3 p-6 pt-2">
                {summaryResult.action_items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <Checkbox
                      id={`task-${index}`}
                      checked={item.completed || false}
                      onCheckedChange={() => handleToggle(index)}
                      className="mt-1"
                    />
                    <div className="flex flex-col gap-1.5 w-full">
                      <label
                        htmlFor={`task-${index}`}
                        className={cn(
                          "text-sm leading-relaxed cursor-pointer select-none",
                          item.completed && "line-through text-muted-foreground"
                        )}
                      >
                        {item.task}
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {item.priority && (
                          <Badge
                            className={cn(
                              getBadgeStyles(item.priority),
                              " font-mono"
                            )}
                          >
                            {item.priority}
                          </Badge>
                        )}
                        {item.assignee &&
                          item.assignee.toLowerCase() !== "unassigned" && (
                            <Badge variant="outline" className="font-mono">
                              <User className="h-2 w-2 opacity-70" />
                              {item.assignee}
                            </Badge>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
