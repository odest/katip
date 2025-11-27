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
import { ImageCropper } from "@workspace/ui/components/common/image-cropper";

export function ProfileImageCard() {
  const t = useTranslations("ProfileImageCard");
  const [cropperOpen, setCropperOpen] = useState(false);
  const { avatarUrl: savedAvatarUrl, avatarFallback } = useUser();
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);

  const displayAvatarUrl = pendingAvatarUrl || savedAvatarUrl;
  const displayFallback = avatarFallback || "GU";

  const handleCropComplete = useCallback((croppedImageUrl: string) => {
    setPendingAvatarUrl(croppedImageUrl);
    toast.success(t("avatarUpdated"));
    // TODO: Upload to Supabase storage and update user metadata
  }, []);

  const handleRemoveAvatar = useCallback(() => {
    setPendingAvatarUrl(null);
    toast.success(t("avatarRemoved"));
    // TODO: Remove from Supabase storage and update user metadata
  }, [t]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 shrink-0">
            <AvatarImage src={displayAvatarUrl} alt="Profile" />
            <AvatarFallback className="text-xl">
              {displayFallback}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-0.5 flex-1">
            <p className="text-xs text-muted-foreground">{t("formatInfo")}</p>
            <p className="text-xs text-muted-foreground">{t("sizeInfo")}</p>
            <p className="text-xs text-muted-foreground">{t("resizeInfo")}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setCropperOpen(true)}
            >
              {displayAvatarUrl ? <RefreshCw /> : <Upload />}
              {displayAvatarUrl ? t("changeAvatar") : t("uploadAvatar")}
            </Button>
            {displayAvatarUrl && (
              <Button
                variant="destructive"
                className="cursor-pointer"
                onClick={handleRemoveAvatar}
              >
                <Trash2Icon />
                {t("removeAvatar")}
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
