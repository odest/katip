import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "@workspace/i18n";
import { createClient } from "@workspace/ui/lib/supabase";
import { getAuthErrorKey } from "@workspace/ui/lib/auth-errors";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";

interface OTPFormProps extends React.ComponentProps<typeof Card> {
  email: string;
  onSuccess?: () => void;
}

export function OTPForm({ email, onSuccess, ...props }: OTPFormProps) {
  const t = useTranslations("OTPForm");
  const tAuthErrors = useTranslations("AuthErrors");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });

    if (error) {
      setError(tAuthErrors(getAuthErrorKey(error.message)));
      setLoading(false);
    } else {
      toast.success(t("signUpSuccess"));
      onSuccess?.();
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) {
      setError(tAuthErrors(getAuthErrorKey(error.message)));
    } else {
      toast.info(t("verificationCodeResent"));
    }
    setResending(false);
  };

  return (
    <Card {...props}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify}>
          <FieldGroup>
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="justify-center">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel htmlFor="otp" className="sr-only">
                {t("verificationCode")}
              </FieldLabel>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  id="otp"
                  required
                  value={otp}
                  onChange={setOtp}
                >
                  <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <FieldDescription className="text-center">
                {t("enterCode")}
              </FieldDescription>
            </Field>
            <Button
              type="submit"
              disabled={loading || resending}
              className="w-full"
            >
              {loading || resending ? <Spinner /> : null}
              {loading
                ? t("verifying")
                : resending
                  ? t("resending")
                  : t("verify")}
            </Button>
            <FieldDescription className="text-center">
              {t("didntReceive")}{" "}
              <button
                type="button"
                onClick={handleResend}
                className="text-primary hover:underline cursor-pointer"
              >
                {t("resend")}
              </button>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
