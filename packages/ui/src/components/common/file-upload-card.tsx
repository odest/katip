"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
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
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

export function FileUploadCard() {
  const t = useTranslations("FileUploadCard");
  const [files, setFiles] = useState<File[]>([]);
  const previousFilesRef = useRef<File[]>([]);

  const handleValueChange = useCallback(
    (newFiles: File[]) => {
      const effectiveFiles =
        newFiles.length > 1
          ? ([newFiles[newFiles.length - 1]].filter(Boolean) as File[])
          : newFiles;

      setFiles(effectiveFiles);

      if (effectiveFiles.length > 0 && effectiveFiles[0]) {
        const newFile = effectiveFiles[0];
        const previousFiles = previousFilesRef.current;

        if (previousFiles.length === 0 || previousFiles[0] !== newFile) {
          const fileName = newFile.name;
          toast.success(t("fileUploaded"), {
            description: `"${
              fileName.length > 30 ? `${fileName.slice(0, 30)}...` : fileName
            }"`,
          });
        }
      }

      previousFilesRef.current = effectiveFiles;
    },
    [t]
  );

  const handleFileReject = useCallback(
    (file: File, message: string) => {
      const fileName = file.name;
      toast.warning(t("fileRejected"), {
        description: `"${
          fileName.length > 30 ? `${fileName.slice(0, 30)}...` : fileName
        }" - ${message}`,
      });
    },
    [t]
  );

  return (
    <Card>
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
