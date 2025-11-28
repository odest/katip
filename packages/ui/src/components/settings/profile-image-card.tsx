"use client";

import { useState, useCallback } from "react";
import { RefreshCw, Upload, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "@workspace/i18n";
import { useUser } from "@workspace/ui/hooks/use-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { ImageCropper } from "@workspace/ui/components/common/image-cropper";

export function ProfileImageCard() {
  const t = useTranslations("ProfileImageCard");
  const [cropperOpen, setCropperOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { avatarUrl, avatarFallback, uploadAvatar, removeAvatar } = useUser();

  const displayFallback = avatarFallback || "GU";
  const isLoading = isUploading || isRemoving;

  const handleCropComplete = useCallback(
    async (croppedImageUrl: string) => {
      setIsUploading(true);
      const result = await uploadAvatar(croppedImageUrl);

      if (result.success) {
        toast.success(t("avatarUpdated"));
      } else {
        toast.error(t("uploadFailed"), { description: result.error });
      }
      setIsUploading(false);
    },
    [uploadAvatar, t]
  );

  const handleRemoveAvatar = useCallback(async () => {
    setIsRemoving(true);
    const result = await removeAvatar();

    if (result.success) {
      toast.success(t("avatarRemoved"));
    } else {
      toast.error(t("removeFailed"), { description: result.error });
    }
    setIsRemoving(false);
  }, [removeAvatar, t]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarImage src={avatarUrl ?? undefined} alt="Profile" />
              <AvatarFallback className="text-xl">
                {displayFallback}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-0.5 flex-1">
              <p className="text-xs text-muted-foreground">{t("formatInfo")}</p>
              <p className="text-xs text-muted-foreground">{t("sizeInfo")}</p>
              <p className="text-xs text-muted-foreground">{t("resizeInfo")}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 w-full sm:w-auto sm:shrink-0">
            <Button
              variant="outline"
              className="cursor-pointer flex-1 sm:flex-none"
              onClick={() => setCropperOpen(true)}
              disabled={isLoading}
            >
              {isUploading ? (
                <Spinner />
              ) : avatarUrl ? (
                <RefreshCw />
              ) : (
                <Upload />
              )}
              {isUploading
                ? t("uploading")
                : avatarUrl
                  ? t("changeAvatar")
                  : t("uploadAvatar")}
            </Button>
            {avatarUrl && (
              <Button
                variant="destructive"
                className="cursor-pointer flex-1 sm:flex-none"
                onClick={handleRemoveAvatar}
                disabled={isLoading}
              >
                {isRemoving ? <Spinner /> : <Trash2Icon />}
                {isRemoving ? t("removing") : t("removeAvatar")}
              </Button>
            )}
          </div>
        </div>

        <ImageCropper
          open={cropperOpen}
          onOpenChange={setCropperOpen}
          onCropComplete={handleCropComplete}
          aspect={1}
          circularCrop={true}
        />
      </CardContent>
    </Card>
  );
}
