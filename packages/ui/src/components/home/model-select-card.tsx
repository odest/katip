"use client";

import { useState, useEffect, useCallback } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useTranslations } from "@workspace/i18n";
import { useModelStore } from "@workspace/ui/stores/model-store";
import { FileCode2, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  getModelsByCategory,
  getModelById,
  CATEGORY_LABELS,
} from "@workspace/ui/config/models";
import { getCachedModels } from "@workspace/ui/lib/utils";

export function ModelSelectCard() {
  const t = useTranslations("ModelSelectCard");
  const {
    selectedModel,
    useQuantized,
    setSelectedModel,
    setUseQuantized,
  } = useModelStore();

  const [isTauriApp, setIsTauriApp] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [cachedModels, setCachedModels] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkPlatform = async () => {
      const isTauriEnv = isTauri();
      setIsTauriApp(isTauriEnv);
      if (isTauriEnv) {
        try {
          const platformType = await platform();
          setIsAndroid(platformType === "android");
        } catch (err) {
          console.error("Error detecting platform:", err);
        }
      }
    };
    checkPlatform();
  }, []);

  const checkCachedModels = useCallback(async () => {
    if (isTauriApp && !isAndroid) return;
    const models = await getCachedModels();
    setCachedModels(models);
  }, [isTauriApp, isAndroid]);

  useEffect(() => {
    checkCachedModels();
  }, [checkCachedModels]);

  const handleSelectModelFile = async () => {
    if (!isTauriApp) {
      toast.error("This feature is only available in the desktop app");
      return;
    }

    try {
      const selected = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: "Model Files",
            extensions: ["bin"],
          },
        ],
      });

      if (typeof selected === "string") {
        const fileName = selected.split(/[\\/]/).pop() || selected;
        setSelectedModel(selected);
        toast.success(t("modelSelected"), {
          description: fileName,
        });
      }
    } catch (err) {
      console.error("Error selecting model file:", err);
      toast.error(t("fileSelectError"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Desktop: Model File Selection (not for Android) */}
        {isTauriApp && !isAndroid && (
          <div className="space-y-4">
            <Button
              onClick={handleSelectModelFile}
              variant="outline"
              className="w-full cursor-pointer"
            >
              <FileCode2 className="size-4 mr-2" />
              {typeof selectedModel === "string" && selectedModel
                ? selectedModel.split(/[\\/]/).pop()
                : t("selectModelFile")}
            </Button>

            <p className="text-xs text-muted-foreground">
              {t("noModelHint")}{" "}
              <a
                href="https://huggingface.co/ggerganov/whisper.cpp/tree/main"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
              >
                Hugging Face
              </a>
            </p>
          </div>
        )}

        {/* Web/Android: Model Selection (Transformers.js CDN) */}
        {(!isTauriApp || isAndroid) && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileCode2 className="size-4" />
                {t("selectModel")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("modelsCached")}
              </p>
              <Select
                value={typeof selectedModel === "string" ? selectedModel : ""}
                onValueChange={(value) => {
                  setSelectedModel(value);
                  const modelInfo = getModelById(value);
                  toast.success(t("modelSelected"), {
                    description: modelInfo?.name || value,
                  });
                }}
              >
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder={t("selectWebModelPlaceholder")}>
                    {typeof selectedModel === "string" && selectedModel && (
                      <span>
                        {getModelById(selectedModel)?.name || selectedModel}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {/* Multilingual Models */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {t(CATEGORY_LABELS.multilingual)}
                  </div>
                  {getModelsByCategory("multilingual").map((model) => (
                    <SelectItem
                      key={model.id}
                      value={model.id}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {cachedModels.has(model.id) && (
                            <>
                              <span className="text-xs text-green-500 font-semibold">
                                {t("cached")}
                              </span>
                              {" • "}
                            </>
                          )}
                          {useQuantized ? model.quantizedSize : model.size} •{" "}
                          {t(model.description)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}

                  {/* englishOnly Models */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                    {t(CATEGORY_LABELS["englishOnly"])}
                  </div>
                  {getModelsByCategory("englishOnly").map((model) => (
                    <SelectItem
                      key={model.id}
                      value={model.id}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {cachedModels.has(model.id) && (
                            <>
                              <span className="text-xs text-green-500 font-semibold">
                                {t("cached")}
                              </span>
                              {" • "}
                            </>
                          )}
                          {useQuantized ? model.quantizedSize : model.size} •{" "}
                          {t(model.description)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}

                  {/* Distilled Models */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                    {t(CATEGORY_LABELS.distilled)}
                  </div>
                  {getModelsByCategory("distilled").map((model) => (
                    <SelectItem
                      key={model.id}
                      value={model.id}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {cachedModels.has(model.id) && (
                            <>
                              <span className="text-xs text-green-500 font-semibold">
                                {t("cached")}
                              </span>
                              {" • "}
                            </>
                          )}
                          {useQuantized ? model.quantizedSize : model.size} •{" "}
                          {t(model.description)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label className="flex items-center gap-2">
                  <Zap className="size-4" />
                  {t("useQuantizedModels")}
                </Label>
                <p className="text-muted-foreground text-xs">
                  {t("useQuantizedModelsDescription")}
                </p>
              </div>
              <Switch
                checked={useQuantized}
                onCheckedChange={setUseQuantized}
                className="ml-2"
              />
            </div>
          </div>
        )}

        {isTauriApp && !isAndroid && typeof selectedModel === "string" && selectedModel && (
          <div className="p-3 rounded-lg border bg-muted/50 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              {t("selectedModelFile")}
            </p>
            <p className="text-sm font-mono break-all">
              {selectedModel.split(/[\\/]/).pop()}
            </p>
          </div>
        )}

        {(!isTauriApp || isAndroid) && typeof selectedModel === "string" && selectedModel && (
          <div className="p-3 rounded-lg border bg-muted/50 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              {t("selectedModel")}
            </p>
            <p className="text-sm font-medium">
              {getModelById(selectedModel)?.name ||
                selectedModel.split("/").pop()}
            </p>
            <p className="text-xs text-muted-foreground">
              {cachedModels.has(selectedModel) && (
                <>
                  <span className="text-xs text-green-500 font-semibold">
                    {t("cached")}
                  </span>
                  {" • "}
                </>
              )}
              {useQuantized
                ? getModelById(selectedModel)?.quantizedSize +
                  " • " +
                  t("quantized")
                : getModelById(selectedModel)?.size}
              {getModelById(selectedModel)?.description && (
                <> • {t(getModelById(selectedModel)!.description)}</>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
