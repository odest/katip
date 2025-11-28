"use client";

import {
  type SyntheticEvent,
  useRef,
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
} from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import { CropIcon, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { isTauri } from "@tauri-apps/api/core";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import { cn } from "@workspace/ui/lib/utils";
import { useTranslations } from "@workspace/i18n";
import { compressImage } from "@workspace/ui/lib/image-compressor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import "react-image-crop/dist/ReactCrop.css";

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface FileWithPreview extends File {
  preview: string;
}

export interface ImageCropperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel?: () => void;
  aspect?: number;
  circularCrop?: boolean;
  maxFileSize?: number;
  acceptedTypes?: string[];
  outputSize?: number;
  outputQuality?: number;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function validateImageFile(
  file: File,
  maxSize: number = MAX_FILE_SIZE,
  acceptedTypes: string[] = ACCEPTED_IMAGE_TYPES
): { valid: boolean; error?: string } {
  if (!acceptedTypes.includes(file.type)) {
    return { valid: false, error: "invalidFileType" };
  }
  if (file.size > maxSize) {
    return { valid: false, error: "fileTooLarge" };
  }
  return { valid: true };
}

export function createFileWithPreview(file: File): FileWithPreview {
  return Object.assign(file, {
    preview: URL.createObjectURL(file),
  }) as FileWithPreview;
}

export function ImageCropper({
  open,
  onOpenChange,
  onCropComplete,
  onCancel,
  aspect = 1,
  circularCrop = true,
  outputSize = 256,
  outputQuality = 0.85,
}: ImageCropperProps) {
  const t = useTranslations("ImageCropper");
  const imgRef = useRef<HTMLImageElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(
    null
  );
  const [crop, setCrop] = useState<Crop>();
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");

  // Tauri native file picker
  const openTauriFilePicker = useCallback(async () => {
    try {
      const selected = await openDialog({
        multiple: false,
        filters: [
          {
            name: "Images",
            extensions: ["jpg", "jpeg", "png", "webp"],
          },
        ],
      });

      if (!selected) {
        onOpenChange(false);
        onCancel?.();
        return;
      }

      const filePath = selected as string;
      const fileData = await readFile(filePath);
      const fileName = filePath.split(/[/\\]/).pop() || "image";
      const extension = fileName.split(".").pop()?.toLowerCase() || "png";

      const mimeType =
        extension === "jpg" || extension === "jpeg"
          ? "image/jpeg"
          : extension === "webp"
            ? "image/webp"
            : "image/png";

      const blob = new Blob([fileData], { type: mimeType });

      // Validate file size
      if (blob.size > MAX_FILE_SIZE) {
        toast.error(t("fileTooLarge"));
        onOpenChange(false);
        onCancel?.();
        return;
      }

      const file = new File([blob], fileName, { type: mimeType });
      setSelectedFile(createFileWithPreview(file));
    } catch {
      onOpenChange(false);
      onCancel?.();
    }
  }, [t, onOpenChange, onCancel]);

  // Web file input handler
  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(t(validation.error as "invalidFileType" | "fileTooLarge"));
        if (inputRef.current) inputRef.current.value = "";
        return;
      }

      setSelectedFile(createFileWithPreview(file));
      if (inputRef.current) inputRef.current.value = "";
    },
    [t]
  );

  const onImageLoad = useCallback(
    (e: SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    },
    [aspect]
  );

  const onCropCompleteHandler = useCallback((crop: PixelCrop) => {
    if (imgRef.current && crop.width && crop.height) {
      const croppedUrl = getCroppedImg(imgRef.current, crop);
      setCroppedImageUrl(croppedUrl);
    }
  }, []);

  function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): string {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      );
    }

    // Return temporary PNG, will be compressed in handleCrop
    return canvas.toDataURL("image/png", 1.0);
  }

  const handleCrop = useCallback(async () => {
    if (croppedImageUrl) {
      try {
        const compressed = await compressImage(croppedImageUrl, {
          maxWidth: outputSize,
          maxHeight: outputSize,
          quality: outputQuality,
          format: "webp",
        });
        onCropComplete(compressed.dataUrl);
      } catch {
        onCropComplete(croppedImageUrl);
      }
    }
    setSelectedFile(null);
    setCrop(undefined);
    setCroppedImageUrl("");
    onOpenChange(false);
  }, [croppedImageUrl, onCropComplete, onOpenChange, t]);

  const handleCancel = useCallback(() => {
    setSelectedFile(null);
    setCrop(undefined);
    setCroppedImageUrl("");
    onOpenChange(false);
    onCancel?.();
  }, [onOpenChange, onCancel]);

  const waitingForFileRef = useRef(false);

  useEffect(() => {
    if (open && !selectedFile) {
      waitingForFileRef.current = true;
      if (isTauri()) {
        // Use Tauri native file picker
        openTauriFilePicker();
      } else {
        // Use web file input
        const timer = setTimeout(() => inputRef.current?.click(), 50);
        return () => clearTimeout(timer);
      }
    }
  }, [open, selectedFile, openTauriFilePicker]);

  useEffect(() => {
    if (selectedFile) {
      waitingForFileRef.current = false;
    }
  }, [selectedFile]);

  useEffect(() => {
    const handleFocus = () => {
      setTimeout(() => {
        if (waitingForFileRef.current && !selectedFile) {
          waitingForFileRef.current = false;
          onOpenChange(false);
          onCancel?.();
        }
      }, 300);
    };

    // Only add focus listener for web (not needed for Tauri native dialog)
    if (open && !selectedFile && !isTauri()) {
      window.addEventListener("focus", handleFocus);
      return () => window.removeEventListener("focus", handleFocus);
    }
  }, [open, selectedFile, onOpenChange, onCancel]);

  return (
    <>
      {/* Web file input - only used in browser */}
      {!isTauri() && (
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />
      )}

      <Dialog
        open={open && !!selectedFile}
        onOpenChange={(newOpen) => !newOpen && handleCancel()}
      >
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>{t("cropTitle")}</DialogTitle>
            <DialogDescription>{t("cropDescription")}</DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center">
            {selectedFile && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => onCropCompleteHandler(c)}
                aspect={aspect}
                circularCrop={circularCrop}
                className="max-h-[400px]"
              >
                <img
                  ref={imgRef}
                  src={selectedFile.preview}
                  alt={t("imagePreview")}
                  onLoad={onImageLoad}
                  className={cn("max-h-[400px] max-w-full object-contain")}
                />
              </ReactCrop>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={handleCancel}
            >
              <Undo2 />
              {t("cancel")}
            </Button>
            <Button
              onClick={handleCrop}
              className="cursor-pointer"
              disabled={!croppedImageUrl}
            >
              <CropIcon />
              {t("crop")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
