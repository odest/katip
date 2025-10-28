"use client";

import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { Upload, X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
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
import { useAudioStore } from "@workspace/ui/stores/audio-store";
import { toast } from "sonner";

const AUDIO_EXTENSIONS = [
  "m4a",
  "wav",
  "mp3",
  "flac",
  "aac",
  "ogg",
  "wma",
  "aiff",
  "ape",
  "opus",
];

export function AudioSelectCard() {
  const t = useTranslations("AudioSelectCard");
  const { selectedAudio, setSelectedAudio } = useAudioStore();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isTauriApp, setIsTauriApp] = useState(false);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const { handleValueChange: onValueChange, handleFileReject } =
    useFileSelect(t);

  useEffect(() => {
    setIsTauriApp(isTauri());
  }, []);

  const handleValueChange = (newFiles: File[]) => {
    const effectiveFiles = onValueChange(newFiles);
    const selectedFile = effectiveFiles[0] || null;
    setSelectedAudio(selectedFile);
  };

  const isAudioFile = (path: string): boolean => {
    const extension = path.split(".").pop()?.toLowerCase();
    return extension ? AUDIO_EXTENSIONS.includes(extension) : false;
  };

  const handleSelectAudioFile = async () => {
    if (!isTauriApp) return;

    try {
      const selected = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: "Audio Files",
            extensions: AUDIO_EXTENSIONS,
          },
        ],
      });

      if (typeof selected === "string") {
        const fileName = selected.split(/[\\/]/).pop() || selected;
        toast.success(t("audioFileAccepted"), {
          description: fileName,
        });
        setSelectedAudio(selected);
      }
    } catch (err) {
      console.error("Error selecting audio file:", err);
      toast.error(t("fileRejected"));
    }
  };

  useEffect(() => {
    if (!isTauriApp) return;

    let unlistenDrop: (() => void) | null = null;
    let unlistenEnter: (() => void) | null = null;
    let unlistenLeave: (() => void) | null = null;

    const setupListeners = async () => {
      unlistenEnter = await listen("tauri://drag-enter", () => {
        setIsDraggingOver(true);
      });

      unlistenLeave = await listen("tauri://drag-leave", () => {
        setIsDraggingOver(false);
      });

      unlistenDrop = await listen<{ paths: string[] }>(
        "tauri://drag-drop",
        async (event) => {
          setIsDraggingOver(false);

          const { paths } = event.payload;

          if (paths.length > 1) {
            toast.warning(t("onlyOneFileAllowed"), {
              description: `${paths.length} ${t("fileRejected")}`,
            });
            return;
          }

          const filePath = paths[0];

          if (!filePath) {
            toast.error(t("invalidFilePath"));
            return;
          }

          if (!isAudioFile(filePath)) {
            const fileName = filePath.split(/[\\/]/).pop() || filePath;
            toast.warning(t("onlyAudioFilesAllowed"), {
              description: fileName,
            });
            return;
          }

          const fileName = filePath.split(/[\\/]/).pop() || filePath;
          toast.success(t("audioFileAccepted"), {
            description: fileName,
          });

          setSelectedAudio(filePath);
        }
      );
    };

    setupListeners();

    return () => {
      unlistenDrop?.();
      unlistenEnter?.();
      unlistenLeave?.();
    };
  }, [isTauriApp, setSelectedAudio, t]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          value={selectedAudio instanceof File ? [selectedAudio] : []}
          onValueChange={handleValueChange}
          onFileReject={handleFileReject}
          accept="audio/*,.m4a,.wav,.mp3,.flac,.aac,.ogg,.wma,.aiff,.ape,.opus"
        >
          <FileUploadDropzone
            ref={dropzoneRef}
            className={
              isDraggingOver
                ? "cursor-pointer border-primary"
                : "cursor-pointer"
            }
            data-tauri-dragging={isDraggingOver ? "" : undefined}
            onClick={(e) => {
              if (isTauriApp) {
                e.preventDefault();
                e.stopPropagation();
                handleSelectAudioFile();
              }
            }}
          >
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
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-fit"
                onClick={(e) => {
                  if (isTauriApp) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectAudioFile();
                  }
                }}
              >
                {t("browseFiles")}
              </Button>
            </FileUploadTrigger>
          </FileUploadDropzone>
          <FileUploadList forceMount={!!selectedAudio}>
            {!isTauriApp && selectedAudio instanceof File && (
              <FileUploadItem value={selectedAudio}>
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
            )}

            {isTauriApp &&
              typeof selectedAudio === "string" &&
              selectedAudio && (
                <div className="flex items-center gap-3 p-3 mt-3 rounded-lg border bg-muted/50">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("selectedAudioFile")}
                    </p>
                    <p className="text-sm font-mono break-all">
                      {selectedAudio.split(/[\\/]/).pop()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 cursor-pointer shrink-0 ml-auto"
                    onClick={() => setSelectedAudio(null)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              )}
          </FileUploadList>
        </FileUpload>
      </CardContent>
    </Card>
  );
}
