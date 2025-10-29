"use client";

import { useState, useEffect } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Slider } from "@workspace/ui/components/slider";
import { Cpu, Zap, ChevronRight, ChevronDown, Info } from "lucide-react";
import { useTranslations } from "@workspace/i18n";
import { usePerformanceStore } from "@workspace/ui/stores/performance-store";

export function PerformanceOptionsCard() {
  const { useGPU, threadCount, setUseGPU, setThreadCount } =
    usePerformanceStore();
  const t = useTranslations("PerformanceOptionsCard");
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const [isGPUEnabled, setIsGPUEnabled] = useState(true);
  const [platformType, setPlatformType] = useState<string | null>(null);

  useEffect(() => {
    const checkPlatform = async () => {
      if (isTauri()) {
        try {
          const platformType = await platform();
          setPlatformType(platformType);
          setIsGPUEnabled(
            platformType === "windows" || platformType === "linux"
          );
          setUseGPU(platformType === "windows" || platformType === "linux");
        } catch (err) {
          console.error("Error detecting platform:", err);
          setIsGPUEnabled(false);
          setUseGPU(false);
        }
      } else {
        setIsGPUEnabled(false);
        setPlatformType("web");
        setUseGPU(false);
      }
    };
    checkPlatform();
  }, []);

  return (
    <Card>
      <CardHeader
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsCardExpanded(!isCardExpanded)}
        role="button"
        tabIndex={0}
      >
        <div>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </div>
        {isCardExpanded ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        )}
      </CardHeader>
      {isCardExpanded && (
        <CardContent className="space-y-6">
          {/* GPU Acceleration */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label className="flex items-center gap-2">
                  <Zap className="size-4" />
                  {t("gpuAcceleration")}
                </Label>
                <p className="text-muted-foreground text-xs">
                  {t("gpuAccelerationDescription")}
                </p>
              </div>
              <Switch
                id="gpu-toggle"
                checked={useGPU}
                onCheckedChange={setUseGPU}
                disabled={!isGPUEnabled}
                className={
                  isGPUEnabled ? "cursor-pointer" : "cursor-not-allowed"
                }
              />
            </div>
            {!isGPUEnabled && (
              <div className="flex items-start gap-2 p-2 rounded-md bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
                <Info className="size-4 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  {platformType === "macos"
                    ? t("gpuMacosWarning")
                    : platformType === "android"
                      ? t("gpuAndroidWarning")
                      : t("gpuWebWarning")}
                </p>
              </div>
            )}
          </div>

          {/* Thread Count */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label className="flex items-center gap-2">
                  <Cpu className="size-4" />
                  {t("cpuThreads")}
                </Label>
                <p className="text-muted-foreground text-xs">
                  {t("cpuThreadsDescription")}
                </p>
              </div>
              <span className="text-md font-medium tabular-nums">
                {threadCount}
              </span>
            </div>
            <Slider
              id="thread-slider"
              value={[threadCount]}
              onValueChange={(value) => setThreadCount(value[0] ?? 1)}
              min={1}
              max={16}
              step={1}
              className="cursor-pointer"
            />
          </div>

          {/* Performance Summary */}
          <div className="p-3 rounded-lg border bg-muted/50 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t("performanceMode")}
            </p>
            <div className="flex items-center gap-2">
              {useGPU && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                  <Zap className="size-3" />
                  {t("gpuEnabled")}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs font-medium">
                <Cpu className="size-3" />
                {threadCount} {threadCount !== 1 ? t("threads") : t("thread")}
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
