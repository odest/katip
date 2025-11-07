"use client";

import { useState, useEffect, useCallback } from "react";
import { isTauri, invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { readDir } from "@tauri-apps/plugin-fs";
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
import { FolderOpen, FileCode2, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  getModelsByCategory,
  getModelById,
  CATEGORY_LABELS,
} from "@workspace/ui/config/models";

interface ModelFile {
  name: string;
  path: string;
}

export function ModelSelectCard() {
  const t = useTranslations("ModelSelectCard");
  const {
    selectedModel,
    modelPath,
    useQuantized,
    setSelectedModel,
    setModelPath,
    setUseQuantized,
  } = useModelStore();

  const [modelFiles, setModelFiles] = useState<ModelFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTauriApp, setIsTauriApp] = useState(false);

  const loadModelsFromPath = useCallback(
    async (path: string) => {
      setIsLoading(true);
      try {
        if (!path) {
          throw new Error("No path provided");
        }

        // Add path to Tauri's file system scope
        if (isTauriApp) {
          try {
            await invoke("add_fs_scope", { path });
          } catch (scopeErr) {
            console.warn("Failed to add path to scope:", scopeErr);
            // Continue anyway as the path might already be in scope
          }
        }

        const entries = await readDir(path);
        const binFiles = entries
          .filter((entry) => entry.isFile && entry.name.endsWith(".bin"))
          .map((entry) => ({
            name: entry.name,
            path: `${path}/${entry.name}`,
          }));

        setModelFiles(binFiles);

        if (binFiles.length === 0) {
          toast.warning(t("noModelsFound"));
        }
      } catch (err) {
        console.error("Error loading models:", err);
        // Clear stored path if it's no longer accessible
        if (err instanceof Error && err.message.includes("forbidden")) {
          toast.error(
            "Model path is no longer accessible. Please select a new path."
          );
          setModelPath("");
          setSelectedModel(null);
        } else {
          toast.error("Failed to load models from path");
        }
        setModelFiles([]);
      } finally {
        setIsLoading(false);
      }
    },
    [t, setModelPath, setSelectedModel, isTauriApp]
  );

  useEffect(() => {
    setIsTauriApp(isTauri());
  }, []);

  useEffect(() => {
    if (isTauriApp && modelPath) {
      loadModelsFromPath(modelPath);
    }
  }, [isTauriApp, modelPath, loadModelsFromPath]);

  const handleSelectModelPath = async () => {
    if (!isTauriApp) {
      toast.error("This feature is only available in the desktop app");
      return;
    }

    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });

      if (typeof selected === "string") {
        setModelPath(selected);
        setSelectedModel("");
        await loadModelsFromPath(selected);
      }
    } catch (err) {
      console.error("Error selecting model path:", err);
      toast.error("Failed to select model path");
    }
  };

  const handleModelSelect = (modelPath: string) => {
    setSelectedModel(modelPath);
    const selectedFile = modelFiles.find((m) => m.path === modelPath);
    if (selectedFile) {
      toast.success(t("modelSelected"), {
        description: selectedFile.name,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Desktop: Model Path Selection */}
        {isTauriApp && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FolderOpen className="size-4" />
              {t("modelPath")}
            </Label>
            <div className="flex gap-2">
              <Button
                onClick={handleSelectModelPath}
                variant="outline"
                className="flex-1 cursor-pointer"
              >
                {modelPath ? (
                  <span className="truncate">
                    {modelPath.split(/[\\/]/).pop()}
                  </span>
                ) : (
                  t("selectModelPath")
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Desktop: Model File Dropdown */}
        {isTauriApp && modelPath && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileCode2 className="size-4" />
              {t("selectModel")}
            </Label>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full border-4 border-primary border-t-transparent size-6" />
              </div>
            ) : modelFiles.length > 0 ? (
              <Select
                value={
                  typeof selectedModel === "string" ? selectedModel : undefined
                }
                onValueChange={handleModelSelect}
              >
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder={t("selectModelPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {modelFiles.map((model) => (
                    <SelectItem
                      key={model.name}
                      value={model.path}
                      className="cursor-pointer"
                    >
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-muted-foreground text-sm p-2 border rounded-md">
                {t("noModelsFound")}
              </p>
            )}
          </div>
        )}

        {/* Web: Model Selection (Transformers.js CDN) */}
        {!isTauriApp && (
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

        {isTauriApp && typeof selectedModel === "string" && selectedModel && (
          <div className="p-3 rounded-lg border bg-muted/50 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              {t("selectedModelFile")}
            </p>
            <p className="text-sm font-mono break-all">
              {selectedModel.split(/[\\/]/).pop()}
            </p>
          </div>
        )}

        {!isTauriApp && typeof selectedModel === "string" && selectedModel && (
          <div className="p-3 rounded-lg border bg-muted/50 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              {t("selectedModel")}
            </p>
            <p className="text-sm font-medium">
              {getModelById(selectedModel)?.name ||
                selectedModel.split("/").pop()}
            </p>
            <p className="text-xs text-muted-foreground">
              {useQuantized
                ? getModelById(selectedModel)?.quantizedSize +
                  " • " +
                  t("quantized")
                : getModelById(selectedModel)?.size}{" "}
              • {t(getModelById(selectedModel)?.description || "")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
