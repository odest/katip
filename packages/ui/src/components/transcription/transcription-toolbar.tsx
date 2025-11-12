import { Button } from "@workspace/ui/components/button";
import { ButtonGroup } from "@workspace/ui/components/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import {
  Copy,
  Download,
  FilePlus,
  RotateCw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useTranslations } from "@workspace/i18n";
import { TranscriptionStatus } from "@workspace/ui/stores/transcription-store";

interface TranscriptionToolbarProps {
  onNew?: () => void;
  onRetry?: () => void;
  onSummarize?: () => void;
  onCopy?: () => void;
  onExport?: () => void;
  onCancel?: () => void;
  status: TranscriptionStatus;
}

export function TranscriptionToolbar({
  onNew,
  onRetry,
  onSummarize,
  onCopy,
  onExport,
  onCancel,
  status,
}: TranscriptionToolbarProps) {
  const t = useTranslations("TranscriptionToolbar");
  const isProcessing = status === "loadingModel" || status === "transcribing";
  const isDone = status === "done" || status === "cancelled";

  return (
    <div className="relative flex items-center justify-between p-1 border rounded-md bg-background">
      <div className="flex items-center gap-1">
        {isProcessing && (
          <Button variant="destructive" onClick={onCancel}>
            <XCircle className="h-4 w-4" />
            <span>{t("cancel")}</span>
          </Button>
        )}

        {isDone && (
          <ButtonGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onNew}>
                  <FilePlus className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("new")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="sm:hidden">
                <p>{t("new")}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onRetry}>
                  <RotateCw className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("retry")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="sm:hidden">
                <p>{t("retry")}</p>
              </TooltipContent>
            </Tooltip>
          </ButtonGroup>
        )}

        <Button onClick={onSummarize} disabled={isProcessing && !isDone}>
          <Sparkles className="h-4 w-4" />
          <span>{t("summarize")}</span>
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onCopy}
              disabled={isProcessing && !isDone}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("copy")}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onExport}
              disabled={isProcessing && !isDone}
            >
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("export")}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
