"use client";

import { useState, useEffect } from "react";
import { isTauri } from "@tauri-apps/api/core";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@workspace/ui/components/file-upload";
import { useTranslations } from "@workspace/i18n";
import { useFileSelect } from "@workspace/ui/hooks/use-file-select";
import { FolderOpen, FileCode2, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ModelFile {
  name: string;
  path: string;
  webFile?: File;
}

export function ModelSelectCard() {
  const t = useTranslations("ModelSelectCard");
  const [modelPath, setModelPath] = useState<string>("");
  const [modelFiles, setModelFiles] = useState<ModelFile[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTauriApp, setIsTauriApp] = useState(false);
  const [webFiles, setWebFiles] = useState<File[]>([]);

  const { handleValueChange: onValueChange, handleFileReject } = useFileSelect(
    t,
    {
      onFileSelect: (file) => {
        setSelectedModel(file.name);
        setModelFiles([
          {
            name: file.name,
            path: file.name,
            webFile: file,
          },
        ]);
      },
    }
  );

  const handleValueChange = (newFiles: File[]) => {
    const effectiveFiles = onValueChange(newFiles);
    setWebFiles(effectiveFiles);
  };

  useEffect(() => {
    setIsTauriApp(isTauri());
  }, []);

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

  const loadModelsFromPath = async (path: string) => {
    setIsLoading(true);
    try {
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
      toast.error("Failed to load models from path");
      setModelFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName);
    const selectedFile = modelFiles.find((m) => m.name === modelName);
    if (selectedFile) {
      toast.success(t("modelSelected"), {
        description: modelName,
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
            <Label htmlFor="model-path" className="flex items-center gap-2">
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
            {!modelPath && (
              <p className="text-muted-foreground text-xs">
                {t("modelPathPlaceholder")}
              </p>
            )}
          </div>
        )}

        {/* Desktop: Model File Dropdown */}
        {isTauriApp && modelPath && (
          <div className="space-y-2">
            <Label htmlFor="model-select" className="flex items-center gap-2">
              <FileCode2 className="size-4" />
              {t("selectModel")}
            </Label>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full border-4 border-primary border-t-transparent size-6" />
              </div>
            ) : modelFiles.length > 0 ? (
              <Select value={selectedModel} onValueChange={handleModelSelect}>
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder={t("selectModelPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {modelFiles.map((model) => (
                    <SelectItem
                      key={model.path}
                      value={model.name}
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

        {/* Web: Drag & Drop File Selection */}
        {!isTauriApp && (
          <FileUpload
            value={webFiles}
            onValueChange={handleValueChange}
            onFileReject={handleFileReject}
            accept=".bin"
          >
            <FileUploadDropzone className="cursor-pointer">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center rounded-full border p-2.5">
                  <Upload className="size-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm">{t("dragAndDrop")}</p>
                <p className="text-muted-foreground text-xs">
                  {t("orClickToBrowse")}
                </p>
              </div>
              <FileUploadTrigger className="cursor-pointer" asChild>
                <Button variant="outline" size="sm" className="mt-2 w-fit">
                  {t("browseFiles")}
                </Button>
              </FileUploadTrigger>
            </FileUploadDropzone>
            <FileUploadList>
              {webFiles.map((file, index) => (
                <FileUploadItem key={index} value={file}>
                  <FileUploadItemPreview />
                  <FileUploadItemMetadata />
                  <FileUploadItemDelete asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 cursor-pointer"
                    >
                      <X />
                    </Button>
                  </FileUploadItemDelete>
                </FileUploadItem>
              ))}
            </FileUploadList>
          </FileUpload>
        )}

        {/* Selected Model Display */}
        {isTauriApp && selectedModel && (
          <div className="p-3 rounded-lg bg-muted/50 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              {t("modelSelected")}
            </p>
            <p className="text-sm font-mono break-all">{selectedModel}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
