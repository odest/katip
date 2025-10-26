"use client";

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
import { Cpu, Zap } from "lucide-react";
import { useTranslations } from "@workspace/i18n";
import { usePerformanceStore } from "@workspace/ui/stores/performance-store";

export function PerformanceSelectCard() {
  const { useGPU, threadCount, setUseGPU, setThreadCount } =
    usePerformanceStore();
  const t = useTranslations("PerformanceSelectCard");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* GPU Acceleration */}
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
            className="cursor-pointer"
          />
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
        <div className="p-3 rounded-lg bg-muted/50 space-y-2">
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
    </Card>
  );
}
