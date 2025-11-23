import { AlertCircle, User } from "lucide-react";
import { useTranslations } from "@workspace/i18n";
import { cn } from "@workspace/ui/lib/utils";
import { getBadgeStyles } from "@workspace/ui/lib/utils";
import { useSummaryStore } from "@workspace/ui/stores/summary-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { TextShimmer } from "@workspace/ui/components/common/text-shimmer";

export const ActionsView = () => {
  const t = useTranslations("ActionsView");
  const { error, isSummarizing, summaryResult, toggleActionItem } =
    useSummaryStore();

  return (
    <div className="flex flex-col h-full w-full pt-6 pb-6 pr-6">
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
                      onCheckedChange={() => toggleActionItem(index)}
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
