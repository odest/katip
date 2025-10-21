"use client";

import { useTranslations } from "@workspace/i18n";
import { Badge } from "@workspace/ui/components/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { CheckCircle2, XCircle, AlertCircle, Cpu, Loader2 } from "lucide-react";
import { useBrowserCapabilities } from "@workspace/ui/hooks/use-browser-capabilities";

export function BrowserCapabilitiesBadge() {
  const t = useTranslations("BrowserCapabilities");
  const { capabilities, isChecking } = useBrowserCapabilities();

  if (isChecking) {
    return (
      <Badge variant="outline" className="gap-1.5">
        <Loader2 className="size-3 animate-spin" />
        <span className="text-xs">{t("checking")}</span>
      </Badge>
    );
  }

  const getStatusIcon = () => {
    if (capabilities.score >= 90)
      return <CheckCircle2 className="size-3 text-green-500" />;
    if (capabilities.score >= 70)
      return <CheckCircle2 className="size-3 text-blue-500" />;
    if (capabilities.score >= 50)
      return <AlertCircle className="size-3 text-yellow-500" />;
    return <XCircle className="size-3 text-red-500" />;
  };

  const getStatusText = () => {
    if (capabilities.score >= 90) return t("excellent");
    if (capabilities.score >= 70) return t("good");
    if (capabilities.score >= 50) return t("limited");
    return t("unsupported");
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="gap-1.5 cursor-help">
            {getStatusIcon()}
            <span className="text-xs">{getStatusText()}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="max-w-sm bg-background border border-border"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="size-4 text-foreground" />
              <span className="font-semibold text-sm text-foreground">
                {t("browserCapabilities")}
              </span>
              <Badge variant="outline" className="ml-auto text-xs">
                {capabilities.score}/100
              </Badge>
            </div>

            <div className="space-y-2">
              <CapabilityItem
                label={t("webAssembly")}
                supported={capabilities.webAssembly}
                required
              />
              <CapabilityItem label={t("simd")} supported={capabilities.simd} />
              <CapabilityItem
                label={t("threads")}
                supported={capabilities.threads}
              />
              <CapabilityItem
                label={t("sharedArrayBuffer")}
                supported={capabilities.sharedArrayBuffer}
              />
              <CapabilityItem
                label={t("audioContext")}
                supported={capabilities.audioContext}
                required
              />
              <CapabilityItem
                label={t("offlineAudioContext")}
                supported={capabilities.offlineAudioContext}
                required
              />
            </div>

            {!capabilities.isSupported && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  {t("unsupportedMessage")}
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface CapabilityItemProps {
  label: string;
  supported: boolean;
  description?: string;
  required?: boolean;
}

function CapabilityItem({
  label,
  supported,
  description,
  required,
}: CapabilityItemProps) {
  return (
    <div className="flex items-start gap-2 text-xs">
      {supported ? (
        <CheckCircle2 className="size-3.5 text-green-500 shrink-0 mt-0.5" />
      ) : (
        <XCircle className="size-3.5 text-red-500 shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={supported ? "text-foreground" : "text-destructive"}>
            {label}
          </span>
          {required && (
            <Badge variant="outline" className="text-[10px] h-4 px-1">
              Required
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}
