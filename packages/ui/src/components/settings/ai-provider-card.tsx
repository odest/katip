"use client";

import { useEffect } from "react";
import { RefreshCw, HardDrive } from "lucide-react";
import { useTranslations } from "@workspace/i18n";
import { cn, getBadgeStyles } from "@workspace/ui/lib/utils";
import { useAI } from "@workspace/ui/hooks/use-ai";
import { AI_PROVIDERS } from "@workspace/ui/lib/ai-client";
import { useSummaryStore } from "@workspace/ui/stores/summary-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@workspace/ui/components/tooltip";

export function AIProviderCard() {
  const t = useTranslations("AIProviderCard");
  const { isChecking, isConnected, availableModels, checkConnection } = useAI();
  const { provider, model, url, apiKey, setSettings } = useSummaryStore();
  const currentProvider = AI_PROVIDERS.find((p) => p.id === provider);

  useEffect(() => {
    if (availableModels.length > 0 && !availableModels.includes(model)) {
      setSettings({ provider, url, model: availableModels[0]!, apiKey });
    }
  }, [availableModels, model, provider, url, apiKey, setSettings]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
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
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] items-center gap-3">
            <Label className="md:text-right">{t("provider")}</Label>
            <Select
              value={provider}
              onValueChange={(val) => {
                const selectedProvider = AI_PROVIDERS.find((p) => p.id === val);
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

          <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] items-center gap-3">
            <Label className="md:text-right">{t("model")}</Label>
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

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="cursor-pointer shrink-0"
                      onClick={() => checkConnection(url, apiKey, provider)}
                      disabled={isChecking}
                    >
                      {isChecking ? (
                        <Spinner />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isConnected ? t("retry") : t("checkConnection")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* URL input - only for local providers */}
          {!currentProvider?.requiresApiKey && (
            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] items-center gap-3">
              <Label className="md:text-right">{t("url")}</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) =>
                  setSettings({ provider, model, url: e.target.value, apiKey })
                }
                className="w-full"
              />
            </div>
          )}

          {/* API Key input - only for cloud providers */}
          {currentProvider?.requiresApiKey && (
            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] items-center gap-3">
              <Label className="md:text-right">{t("apiKey")}</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) =>
                  setSettings({ provider, model, url, apiKey: e.target.value })
                }
                placeholder={t("apiKeyPlaceholder")}
                className="w-full"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
