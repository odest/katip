import { useEffect, useState } from "react";
import {
  Eye,
  Copy,
  XCircle,
  Download,
  FilePlus,
  Sparkles,
  EyeClosed,
  RefreshCw,
  ChevronDownIcon,
} from "lucide-react";
import { useTranslations } from "@workspace/i18n";
import { cn } from "@workspace/ui/lib/utils";
import { getBadgeStyles } from "@workspace/ui/lib/utils";
import { useAI } from "@workspace/ui/hooks/use-ai";
import { AI_PROVIDERS } from "@workspace/ui/lib/ai-client";
import { useSummaryStore } from "@workspace/ui/stores/summary-store";
import { TranscriptionStatus } from "@workspace/ui/stores/transcription-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@workspace/ui/components/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@workspace/ui/components/input-group";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import { Spinner } from "@workspace/ui/components/spinner";
import { Button } from "@workspace/ui/components/button";
import { ButtonGroup } from "@workspace/ui/components/button-group";

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
  const [showApiKey, setShowApiKey] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { isChecking, isConnected, availableModels, checkConnection } = useAI();
  const {
    isSummarizing,
    summaryResult,
    provider,
    model,
    url,
    apiKey,
    setSettings,
    error,
  } = useSummaryStore();
  const currentProvider = AI_PROVIDERS.find((p) => p.id === provider);
  const isProcessing = status === "loadingModel" || status === "transcribing";
  const isDone = status === "done" || status === "cancelled";

  useEffect(() => {
    if (availableModels.length > 0 && !availableModels.includes(model)) {
      setSettings({ provider, url, model: availableModels[0]!, apiKey });
    }
  }, [availableModels, model, provider, url, apiKey, setSettings]);

  const handleSummarizeClick = () => {
    if (!model || !url || !isConnected) {
      setIsPopoverOpen(true);
      if (!isConnected) {
        checkConnection(url, apiKey, provider);
      }
    } else {
      onSummarize?.();
    }
  };

  return (
    <div className="relative flex items-center justify-between p-1 border rounded-md bg-card">
      <div className="flex items-center gap-2">
        {isProcessing && (
          <Button
            variant="destructive"
            onClick={onCancel}
            className="cursor-pointer"
          >
            <XCircle className="h-4 w-4" />
            <span>{t("cancel")}</span>
          </Button>
        )}

        {isDone && (
          <ButtonGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={onNew}
                  className="cursor-pointer"
                >
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
                <Button
                  variant="outline"
                  onClick={onRetry}
                  className="cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("retry")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="sm:hidden">
                <p>{t("retry")}</p>
              </TooltipContent>
            </Tooltip>
          </ButtonGroup>
        )}

        <ButtonGroup>
          <Button
            onClick={handleSummarizeClick}
            disabled={(isProcessing && !isDone) || isSummarizing}
            className="rounded-r-none border-r border-white/20 dark:border-black/20 cursor-pointer"
          >
            {isSummarizing ? (
              <>
                <Spinner />
                <span>{t("summarizing")}</span>
              </>
            ) : (
              <>
                <Sparkles />
                <span>
                  {error
                    ? t("tryAgain")
                    : summaryResult
                      ? t("resummarize")
                      : t("summarize")}
                </span>
              </>
            )}
          </Button>

          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      size="icon"
                      disabled={(isProcessing && !isDone) || isSummarizing}
                      className="rounded-l-none border-l-0 px-2 cursor-pointer"
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("configureAI")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <PopoverContent
              align="center"
              className="w-80 p-0 bg-card"
              sideOffset={10}
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="font-semibold">{t("aiConfiguration")}</div>
                <Badge
                  variant="outline"
                  className={cn(
                    `${
                      isChecking
                        ? getBadgeStyles("checking")
                        : isConnected
                          ? getBadgeStyles("connected")
                          : getBadgeStyles("disconnected")
                    } font-mono`
                  )}
                >
                  {isChecking
                    ? t("checking")
                    : isConnected
                      ? t("connected")
                      : t("disconnected")}
                </Badge>
              </div>

              <div className="grid gap-4 p-4">
                <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                  <Label className="text-right">{t("provider")}</Label>
                  <Select
                    value={provider}
                    onValueChange={(val) => {
                      const selectedProvider = AI_PROVIDERS.find(
                        (p) => p.id === val
                      );
                      const newUrl = selectedProvider?.defaultUrl ?? url;
                      const newApiKey = selectedProvider?.requiresApiKey
                        ? apiKey
                        : "";
                      setSettings({
                        provider: val,
                        model,
                        url: newUrl,
                        apiKey: newApiKey,
                      });
                    }}
                  >
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder={t("selectProvider")} />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_PROVIDERS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                  <Label className="text-right">{t("model")}</Label>
                  <div className="flex gap-2 min-w-0">
                    <div className="flex-1 min-w-0">
                      {isConnected && availableModels.length > 0 ? (
                        <Select
                          value={model}
                          onValueChange={(val) =>
                            setSettings({ provider, model: val, url, apiKey })
                          }
                        >
                          <SelectTrigger className="w-full cursor-pointer [&>span]:truncate">
                            <SelectValue placeholder={t("selectModel")} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableModels.map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={model}
                          onChange={(e) =>
                            setSettings({
                              provider,
                              model: e.target.value,
                              url,
                              apiKey,
                            })
                          }
                          placeholder="e.g. Llama3"
                          className="w-full"
                        />
                      )}
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="cursor-pointer shrink-0"
                          onClick={() => checkConnection(url, apiKey, provider)}
                          disabled={isChecking}
                        >
                          {isChecking ? <Spinner /> : <RefreshCw />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isConnected ? t("retry") : t("checkConnection")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* URL input - only for local providers */}
                {!currentProvider?.requiresApiKey && (
                  <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                    <Label className="text-right">{t("url")}</Label>
                    <InputGroup>
                      <InputGroupInput
                        id="url"
                        value={url}
                        onChange={(e) =>
                          setSettings({
                            provider,
                            model,
                            url: e.target.value,
                            apiKey,
                          })
                        }
                        className="w-full"
                      />
                      <InputGroupAddon align="inline-end">
                        {url && (
                          <InputGroupButton
                            size="icon-xs"
                            onClick={() => {
                              setSettings({
                                provider,
                                model,
                                url: "",
                                apiKey,
                              });
                            }}
                          >
                            <XCircle className="size-4" />
                          </InputGroupButton>
                        )}
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                )}

                {/* API Key input - only for cloud providers */}
                {currentProvider?.requiresApiKey && (
                  <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                    <Label className="text-right">{t("apiKey")}</Label>
                    <InputGroup>
                      <InputGroupInput
                        id="apiKey"
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) =>
                          setSettings({
                            provider,
                            model,
                            url,
                            apiKey: e.target.value,
                          })
                        }
                        placeholder={t("apiKeyPlaceholder")}
                        className="w-full"
                      />
                      <InputGroupAddon align="inline-end">
                        {apiKey && (
                          <InputGroupButton
                            size="icon-xs"
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? <Eye /> : <EyeClosed />}
                          </InputGroupButton>
                        )}
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </ButtonGroup>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onCopy}
              disabled={isProcessing && !isDone}
              className="cursor-pointer"
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
              className="cursor-pointer"
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
