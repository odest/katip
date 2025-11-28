import { useState } from "react";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useTranslations } from "@workspace/i18n";
import { useAuth } from "@workspace/ui/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";

interface ForgotPasswordFormProps extends React.ComponentProps<"div"> {
  onBackToSignin?: () => void;
  onVerifyOtp?: (email: string) => void;
}

export function ForgotPasswordForm({
  className,
  onBackToSignin,
  onVerifyOtp,
  ...props
}: ForgotPasswordFormProps) {
  const t = useTranslations("ForgotPasswordForm");
  const { resetPasswordRequest, loading, error } = useAuth();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await resetPasswordRequest(email);

    if (!error) {
      toast.success(t("resetLinkSent"));
      onVerifyOtp?.(email);
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
                <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  className="cursor-pointer"
                  disabled={loading}
                >
                  {loading ? <Spinner /> : <Mail />}
                  {loading ? t("sending") : t("sendResetLink")}
                </Button>
              </Field>
              <Field>
                <FieldDescription className="text-center">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onBackToSignin?.();
                    }}
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    {t("backToSignin")}
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
