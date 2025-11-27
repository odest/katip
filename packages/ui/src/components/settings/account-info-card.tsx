"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
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

export function AccountInfoCard() {
  const t = useTranslations("AccountInfoCard");
  const { user, fullName: userFullName, email: userEmail } = useUser();

  const initialFullName = userFullName || "";
  const initialEmail = userEmail || "";

  const [fullName, setFullName] = useState(initialFullName);
  const [email, setEmail] = useState(initialEmail);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<"name" | "email" | null>(
    null
  );

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

  const handleConfirm = () => {
    if (pendingAction === "name") {
      // TODO: Implement update name logic
    } else if (pendingAction === "email") {
      // TODO: Implement update email logic
    }
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

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
              onClick={() => setShowConfirmDialog(false)}
            >
              {t("cancel")}
            </Button>
            <Button className="cursor-pointer" onClick={handleConfirm}>
              {t("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
