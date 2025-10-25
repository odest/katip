"use client";

import { useState } from "react";
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
import { Upload, X } from "lucide-react";

export function AudioSelectCard() {
  const t = useTranslations("AudioSelectCard");
  const [files, setFiles] = useState<File[]>([]);

  const { handleValueChange: onValueChange, handleFileReject } =
    useFileSelect(t);

  const handleValueChange = (newFiles: File[]) => {
    const effectiveFiles = onValueChange(newFiles);
    setFiles(effectiveFiles);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          value={files}
          onValueChange={handleValueChange}
          onFileReject={handleFileReject}
          accept="audio/*,.m4a,.wav,.mp3,.flac,.aac,.ogg,.wma,.aiff,.ape,.opus"
        >
          <FileUploadDropzone>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center justify-center rounded-full border p-2.5">
                <Upload className="size-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-sm">{t("dragAndDrop")}</p>
              <p className="text-muted-foreground text-xs">
                {t("orClickToBrowse")}
              </p>
            </div>
            <FileUploadTrigger asChild>
              <Button variant="outline" size="sm" className="mt-2 w-fit">
                {t("browseFiles")}
              </Button>
            </FileUploadTrigger>
          </FileUploadDropzone>
          <FileUploadList>
            {files.map((file, index) => (
              <FileUploadItem key={index} value={file}>
                <FileUploadItemPreview />
                <FileUploadItemMetadata />
                <FileUploadItemDelete asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    <X />
                  </Button>
                </FileUploadItemDelete>
              </FileUploadItem>
            ))}
          </FileUploadList>
        </FileUpload>
      </CardContent>
    </Card>
  );
}
