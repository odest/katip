import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeClosed, KeyRound } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useTranslations } from "@workspace/i18n";
import { useAuth } from "@workspace/ui/hooks/use-auth";
import { useUser } from "@workspace/ui/hooks/use-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";

interface ResetPasswordFormProps extends React.ComponentProps<"div"> {
  onSuccess?: () => void;
}

export function ResetPasswordForm({
  className,
  onSuccess,
  ...props
}: ResetPasswordFormProps) {
  const t = useTranslations("ResetPasswordForm");
  const { resetPassword, loading, error, setError } = useAuth();
  const { signOut } = useUser();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    const { error } = await resetPassword(newPassword);

    if (!error) {
      await signOut();
      toast.success(t("passwordResetSuccess"));
      onSuccess?.();
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription className="justify-center">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <Field>
                <FieldLabel htmlFor="newPassword">
                  {t("newPassword")}
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder={t("newPasswordPlaceholder")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <Eye /> : <EyeClosed />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  {t("confirmPassword")}
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("confirmPasswordPlaceholder")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <Eye /> : <EyeClosed />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              <Field>
                <Button
                  type="submit"
                  className="cursor-pointer"
                  disabled={loading}
                >
                  {loading ? <Spinner /> : <KeyRound />}
                  {loading ? t("resetting") : t("resetPassword")}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
