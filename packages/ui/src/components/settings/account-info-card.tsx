"use client";

import { useState, useEffect, useCallback } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "@workspace/i18n";
import { useUser } from "@workspace/ui/hooks/use-user";
import { useAuthStore } from "@workspace/ui/stores/auth-store";
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
    updateEmail,
  } = useUser();
  const { setOtpEmail, setOtpType, setFormView, setOpenDialog } =
    useAuthStore();

  const initialFullName = userFullName || "";
  const initialEmail = userEmail || "";

  const [fullName, setFullName] = useState(initialFullName);
  const [email, setEmail] = useState(initialEmail);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(userFullName || "");
      setEmail(userEmail || "");
    }
  }, [user, userFullName, userEmail]);

  const isFullNameChanged = fullName !== initialFullName;
  const isEmailChanged = email !== initialEmail;

  const handleNameUpdate = useCallback(async () => {
    setIsUpdating(true);
    const result = await updateName(fullName.trim());

    if (result.success) {
      toast.success(t("nameUpdated"));
      setShowConfirmDialog(false);
    } else {
      toast.error(t("updateFailed"), { description: result.error });
    }
    setIsUpdating(false);
  }, [fullName, updateName, t]);

  const handleEmailUpdate = useCallback(async () => {
    setIsUpdating(true);
    const result = await updateEmail(email.trim(), password);

    if (result.success) {
      toast.success(t("verificationSent"));
      setShowPasswordDialog(false);
      setPassword("");
      setOtpEmail(email.trim());
      setOtpType("email_change");
      setFormView("otp");
      setOpenDialog(true);
    } else {
      if (result.error === "incorrectPassword") {
        toast.error(t("incorrectPassword"));
      } else {
        toast.error(t("updateFailed"), { description: result.error });
      }
    }
    setIsUpdating(false);
  }, [
    email,
    password,
    updateEmail,
    t,
    setOtpEmail,
    setOtpType,
    setFormView,
    setOpenDialog,
  ]);

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
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Input
                    id="fullName"
                    placeholder={t("fullNamePlaceholder")}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <Button
                    disabled={!isFullNameChanged}
                    className="cursor-pointer w-full sm:w-auto"
                    onClick={() => {
                      setShowConfirmDialog(true);
                    }}
                  >
                    <Save />
                    {t("updateName")}
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">{t("email")}</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button
                    disabled={!isEmailChanged}
                    className="cursor-pointer w-full sm:w-auto"
                    onClick={() => {
                      setShowPasswordDialog(true);
                    }}
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
            <DialogTitle>{t("confirmNameTitle")}</DialogTitle>
            <DialogDescription>{t("confirmNameDescription")}</DialogDescription>
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
              onClick={handleNameUpdate}
            >
              {isUpdating && <Spinner />}
              {isUpdating ? t("updating") : t("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showPasswordDialog}
        onOpenChange={(open) => {
          setShowPasswordDialog(open);
          if (!open) {
            setPassword("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmEmailTitle")}</DialogTitle>
            <DialogDescription>
              {t("passwordRequiredDescription")}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEmailUpdate();
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  placeholder={t("currentPasswordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                disabled={isUpdating}
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPassword("");
                }}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={isUpdating || !password}
              >
                {isUpdating && <Spinner />}
                {isUpdating ? t("updating") : t("confirm")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
