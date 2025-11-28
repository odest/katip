"use client";

import { LogIn, UserPlus, Ghost } from "lucide-react";
import { useTranslations } from "@workspace/i18n";
import { useAuthStore } from "@workspace/ui/stores/auth-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";

export function GuestCard() {
  const t = useTranslations("GuestCard");
  const { setOpenDialog, formView, setFormView } = useAuthStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed rounded-lg">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
            <Ghost className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-base mb-1">{t("welcomeTitle")}</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {t("welcomeMessage")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 p-6  w-full sm:w-auto">
            <Button
              variant="default"
              className="cursor-pointer"
              onClick={() => {
                {
                  formView == "otp"
                    ? setFormView("otp")
                    : setFormView("signin");
                }
                setOpenDialog(true);
              }}
            >
              <LogIn className="mr-2 h-4 w-4" />
              {t("signIn")}
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                {
                  formView == "otp"
                    ? setFormView("otp")
                    : setFormView("signup");
                }
                setOpenDialog(true);
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {t("signUp")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
