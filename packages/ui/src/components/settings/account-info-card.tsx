"use client";

import { useState, useEffect, useCallback } from "react";
import { Save } from "lucide-react";
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

export function AccountInfoCard() {
  const t = useTranslations("AccountInfoCard");
  const {
    user,
    fullName: userFullName,
    email: userEmail,
    updateName,
  } = useUser();

  const initialFullName = userFullName || "";
  const initialEmail = userEmail || "";

  const [fullName, setFullName] = useState(initialFullName);
  const [email, setEmail] = useState(initialEmail);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<"name" | "email" | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(userFullName || "");
      setEmail(userEmail || "");
    }
  }, [user, userFullName, userEmail]);

  const isFullNameChanged = fullName !== initialFullName;
  const isEmailChanged = email !== initialEmail;

  const handleUpdateName = () => {
    setPendingAction("name");
    setShowConfirmDialog(true);
  };

  const handleUpdateEmail = () => {
    setPendingAction("email");
    setShowConfirmDialog(true);
  };

  const handleConfirm = useCallback(async () => {
    if (pendingAction === "name") {
      setIsUpdating(true);
      const result = await updateName(fullName.trim());

      if (result.success) {
        toast.success(t("nameUpdated"));
        setShowConfirmDialog(false);
        setPendingAction(null);
      } else {
        toast.error(t("updateFailed"), { description: result.error });
      }
    } else if (pendingAction === "email") {
      // TODO: Implement update email logic
      setShowConfirmDialog(false);
      setPendingAction(null);
    }
    setIsUpdating(false);
  }, [pendingAction, fullName, updateName, t]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">{t("fullName")}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fullName"
                    placeholder={t("fullNamePlaceholder")}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <Button
                    disabled={!isFullNameChanged}
                    className="cursor-pointer"
                    onClick={handleUpdateName}
                  >
                    <Save />
                    {t("updateName")}
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">{t("email")}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button
                    disabled={!isEmailChanged}
                    className="cursor-pointer"
                    onClick={handleUpdateEmail}
                  >
                    <Save />
                    {t("updateEmail")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === "name"
                ? t("confirmNameTitle")
                : t("confirmEmailTitle")}
            </DialogTitle>
            <DialogDescription>
              {pendingAction === "name"
                ? t("confirmNameDescription")
                : t("confirmEmailDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={isUpdating}
              onClick={() => setShowConfirmDialog(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              className="cursor-pointer"
              disabled={isUpdating}
              onClick={handleConfirm}
            >
              {isUpdating && <Spinner />}
              {isUpdating ? t("updating") : t("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
