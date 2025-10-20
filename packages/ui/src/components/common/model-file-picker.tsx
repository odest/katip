"use client";

import { useRef } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useTranslations } from "@workspace/i18n";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";

export interface SelectedModelInfo {
  path: string;
  webFile?: File;
}

interface ModelFilePickerProps {
  onModelSelect: (model: SelectedModelInfo | null) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function ModelFilePicker({
  onModelSelect,
  disabled = false,
  label,
  className,
}: ModelFilePickerProps) {
  const t = useTranslations("ModelFilePicker");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectModel = async () => {
    try {
      if (isTauri()) {
        // Tauri - Native file picker
        const selected = await open({
          multiple: false,
          directory: false,
          filters: [
            {
              name: "Whisper Model",
              extensions: ["bin"],
            },
          ],
        });

        if (selected) {
          onModelSelect({ path: selected });
        }
      } else {
        // Web - HTML file input
        fileInputRef.current?.click();
      }
    } catch (err) {
      console.error("Error selecting model:", err);
      onModelSelect(null);
    }
  };

  const handleWebFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const modelInfo: SelectedModelInfo = {
        path: file.name,
        webFile: file,
      };
      onModelSelect(modelInfo);
    } else {
      onModelSelect(null);
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".bin"
        onChange={handleWebFileSelect}
        className="hidden"
      />

      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <Button
          onClick={handleSelectModel}
          disabled={disabled}
          className="w-full"
          variant="outline"
        >
          {t("chooseModel")}
        </Button>
      </div>
    </div>
  );
}
