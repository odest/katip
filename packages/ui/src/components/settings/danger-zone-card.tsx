"use client";

import { useState, useCallback } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";

export function DangerZoneCard() {
  const t = useTranslations("DangerZoneCard");
  const { deleteAccount } = useUser();
  const [confirmText, setConfirmText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isDeleteEnabled = confirmText === "DELETE";

  const handleDeleteAccount = useCallback(async () => {
    setIsDeleting(true);
    const result = await deleteAccount();

    if (result.success) {
      toast.success(t("accountDeleted"));
      setDialogOpen(false);
      setConfirmText("");
    } else {
      toast.error(t("deleteFailed"), { description: result.error });
    }
    setIsDeleting(false);
  }, [deleteAccount, t]);

  return (
    <>
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {t("title")}
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {t("warningMessage")}
            </p>
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={() => setDialogOpen(true)}
            >
              <Trash2 />
              {t("deleteAccount")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t("confirmTitle")}
            </DialogTitle>
            <DialogDescription>{t("confirmDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="confirmDelete">{t("typeToConfirm")} </Label>
              <Input
                id="confirmDelete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                setDialogOpen(false);
                setConfirmText("");
              }}
              disabled={isDeleting}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              disabled={!isDeleteEnabled || isDeleting}
              onClick={handleDeleteAccount}
            >
              {isDeleting ? <Spinner /> : null}
              {isDeleting ? t("deleting") : t("confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
