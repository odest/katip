"use client";

import { useRef } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useTranslations } from "@workspace/i18n";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";

export interface SelectedFileInfo {
  path: string;
  webFile?: File;
}

interface AudioFilePickerProps {
  onFileSelect: (file: SelectedFileInfo | null) => void;
  disabled?: boolean;
  accept?: string;
  label?: string;
  className?: string;
}

export function AudioFilePicker({
  onFileSelect,
  disabled = false,
  accept = "audio/*,.m4a,.wav,.mp3,.flac,.aac,.ogg,.wma,.aiff,.ape,.opus",
  label,
  className,
}: AudioFilePickerProps) {
  const t = useTranslations("AudioFilePicker");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFile = async () => {
    try {
      if (isTauri()) {
        // Tauri - Native file picker
        const selected = await open({
          multiple: false,
          directory: false,
          filters: [
            {
              name: "Audio Files",
              extensions: [
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
              ],
            },
          ],
        });

        if (selected) {
          const fileInfo: SelectedFileInfo = {
            path: selected,
          };

          onFileSelect(fileInfo);
        }
      } else {
        // Web - HTML file input
        fileInputRef.current?.click();
      }
    } catch (err) {
      console.error("Error selecting file:", err);
      onFileSelect(null);
    }
  };

  const handleWebSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileInfo: SelectedFileInfo = {
        path: file.name,
        webFile: file,
      };
      onFileSelect(fileInfo);
    } else {
      onFileSelect(null);
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleWebSelectFile}
        className="hidden"
      />

      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <Button
          onClick={handleSelectFile}
          disabled={disabled}
          className="w-full"
          variant="outline"
        >
          {t("chooseFile")}
        </Button>
      </div>
    </div>
  );
}
