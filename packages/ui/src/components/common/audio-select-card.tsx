"use client";

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
import { Upload, X } from "lucide-react";

export function AudioSelectCard() {
  const t = useTranslations("AudioSelectCard");
  const { audioFile, setAudioFile } = useAudioStore();

  const { handleValueChange: onValueChange, handleFileReject } =
    useFileSelect(t);

  const handleValueChange = (newFiles: File[]) => {
    const effectiveFiles = onValueChange(newFiles);
    const selectedFile = effectiveFiles[0] || null;
    setAudioFile(selectedFile);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          value={audioFile ? [audioFile] : []}
          onValueChange={handleValueChange}
          onFileReject={handleFileReject}
          accept="audio/*,.m4a,.wav,.mp3,.flac,.aac,.ogg,.wma,.aiff,.ape,.opus"
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
            {audioFile && (
              <FileUploadItem value={audioFile}>
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
          </FileUploadList>
        </FileUpload>
      </CardContent>
    </Card>
  );
}
