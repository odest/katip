"use client";

import { useState } from "react";
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
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  ChevronRight,
  ChevronDown,
  Settings2,
  Mic,
  Thermometer,
  Search,
  Timer,
  PenTool,
  Clock,
  CaseSensitive,
  TextCursorInput,
  Cpu,
} from "lucide-react";
import {
  useAdvancedStore,
  SamplingStrategy,
} from "@workspace/ui/stores/advanced-store";
import { useTranslations } from "@workspace/i18n";

export function AdvancedOptionsCard() {
  const t = useTranslations("AdvancedOptionsCard");
  const {
    strategy,
    bestOf,
    beamSize,
    temperature,
    initialPrompt,
    suppressNonSpeechTokens,
    patience,
    lengthPenalty,
    suppressBlank,
    tokenTimestamps,
    gpuDevice,
    maxLength,
    splitOnWord,
    setStrategy,
    setBestOf,
    setBeamSize,
    setTemperature,
    setInitialPrompt,
    setSuppressNonSpeechTokens,
    setPatience,
    setLengthPenalty,
    setSuppressBlank,
    setTokenTimestamps,
    setGpuDevice,
    setMaxLength,
    setSplitOnWord,
  } = useAdvancedStore();
  const [isCardExpanded, setIsCardExpanded] = useState(false);

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
          {/* --- STRATEGY --- */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <Label className="flex items-center gap-2">
                <Settings2 className="size-4" />
                {t("samplingStrategy")}
              </Label>
              <p className="text-muted-foreground text-xs">
                {t("samplingStrategyDescription")}
              </p>
            </div>
            <Select
              value={strategy}
              onValueChange={(value: SamplingStrategy) => setStrategy(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="greedy">{t("greedy")}</SelectItem>
                <SelectItem value="beamSearch">{t("beamSearch")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* --- STRATEGY-SPECIFIC SETTINGS --- */}
          {strategy === "greedy" ? (
            <div className="space-y-3 pl-4 border-l-2">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <Label>{t("bestOf")}</Label>
                  <p className="text-muted-foreground text-xs">
                    {t("bestOfDescription")}
                  </p>
                </div>
                <span className="text-md font-medium tabular-nums">
                  {bestOf}
                </span>
              </div>
              <Slider
                id="best-of-slider"
                value={[bestOf]}
                onValueChange={(value) => setBestOf(value[0] ?? 1)}
                min={1}
                max={10}
                step={1}
              />
            </div>
          ) : (
            <div className="space-y-6 pl-4 border-l-2">
              {/* Beam Size */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <Label>{t("beamSize")}</Label>
                    <p className="text-muted-foreground text-xs">
                      {t("beamSizeDescription")}
                    </p>
                  </div>
                  <span className="text-md font-medium tabular-nums">
                    {beamSize}
                  </span>
                </div>
                <Slider
                  id="beam-size-slider"
                  value={[beamSize]}
                  onValueChange={(value) => setBeamSize(value[0] ?? 1)}
                  min={1}
                  max={20}
                  step={1}
                />
              </div>
              {/* Patience */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <Label className="flex items-center gap-2">
                      <Timer className="size-4" />
                      {t("patience")}
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      {t("patienceDescription")}
                    </p>
                  </div>
                  <span className="text-md font-medium tabular-nums">
                    {patience.toFixed(1)}
                  </span>
                </div>
                <Slider
                  id="patience-slider"
                  value={[patience]}
                  onValueChange={(value) => setPatience(value[0] ?? 0)}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>
              {/* Length Penalty */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <Label className="flex items-center gap-2">
                      <PenTool className="size-4" />
                      {t("lengthPenalty")}
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      {t("lengthPenaltyDescription")}
                    </p>
                  </div>
                  <span className="text-md font-medium tabular-nums">
                    {lengthPenalty.toFixed(1)}
                  </span>
                </div>
                <Slider
                  id="length-penalty-slider"
                  value={[lengthPenalty]}
                  onValueChange={(value) => setLengthPenalty(value[0] ?? 0)}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>
            </div>
          )}
          {/* --- GENERAL TRANSCRIPTION SETTINGS --- */}
          {/* Temperature */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label className="flex items-center gap-2">
                  <Thermometer className="size-4" />
                  {t("temperature")}
                </Label>
                <p className="text-muted-foreground text-xs">
                  {t("temperatureDescription")}
                </p>
              </div>
              <span className="text-md font-medium tabular-nums">
                {temperature.toFixed(1)}
              </span>
            </div>
            <Slider
              id="temp-slider"
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0] ?? 0)}
              min={0}
              max={1}
              step={0.1}
            />
          </div>
          {/* Max Length */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label className="flex items-center gap-2">
                  <TextCursorInput className="size-4" />
                  {t("maxSegmentLength")}
                </Label>
                <p className="text-muted-foreground text-xs">
                  {t("maxSegmentLengthDescription")}
                </p>
              </div>
              <span className="text-md font-medium tabular-nums">
                {maxLength === 0 ? t("auto") : maxLength}
              </span>
            </div>
            <Slider
              id="max-len-slider"
              value={[maxLength]}
              onValueChange={(value) => setMaxLength(value[0] ?? 0)}
              min={0}
              max={100}
              step={5}
            />
          </div>
          {/* Initial Prompt */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Search className="size-4" />
                {t("initialPrompt")}
              </Label>
              <p className="text-muted-foreground text-xs">
                {t("initialPromptDescription")}
              </p>
            </div>
            <Input
              id="initial-prompt"
              placeholder={t("initialPromptPlaceholder")}
              value={initialPrompt}
              onChange={(e) => setInitialPrompt(e.target.value)}
            />
          </div>
          {/* --- TOGGLES --- */}
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label className="flex items-center gap-2">
                  <Mic className="size-4" />
                  {t("suppressNonSpeechTokens")}
                </Label>
                <p className="text-muted-foreground text-xs">
                  {t("suppressNonSpeechTokensDescription")}
                </p>
              </div>
              <Switch
                id="suppress-tokens-toggle"
                checked={suppressNonSpeechTokens}
                onCheckedChange={setSuppressNonSpeechTokens}
              />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label className="flex items-center gap-2">
                  <Clock className="size-4" />
                  {t("tokenTimestamps")}
                </Label>
                <p className="text-muted-foreground text-xs">
                  {t("tokenTimestampsDescription")}
                </p>
              </div>
              <Switch
                id="token-timestamps-toggle"
                checked={tokenTimestamps}
                onCheckedChange={setTokenTimestamps}
              />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label className="flex items-center gap-2">
                  <CaseSensitive className="size-4" />
                  {t("splitOnWord")}
                </Label>
                <p className="text-muted-foreground text-xs">
                  {t("splitOnWordDescription")}
                </p>
              </div>
              <Switch
                id="split-on-word-toggle"
                checked={splitOnWord}
                onCheckedChange={setSplitOnWord}
              />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label className="flex items-center gap-2">
                  <Mic className="size-4" />
                  {t("suppressBlank")}
                </Label>
                <p className="text-muted-foreground text-xs">
                  {t("suppressBlankDescription")}
                </p>
              </div>
              <Switch
                id="suppress-blank-toggle"
                checked={suppressBlank}
                onCheckedChange={setSuppressBlank}
              />
            </div>
          </div>
          {/* --- ADVANCED HARDWARE --- */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <Label className="flex items-center gap-2">
                <Cpu className="size-4" />
                {t("gpuDeviceIndex")}
              </Label>
              <p className="text-muted-foreground text-xs">
                {t("gpuDeviceIndexDescription")}
              </p>
            </div>
            <Input
              className="max-w-16"
              id="gpu-device"
              type="number"
              value={gpuDevice}
              onChange={(e) => setGpuDevice(parseInt(e.target.value, 10) || 0)}
              min={0}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
