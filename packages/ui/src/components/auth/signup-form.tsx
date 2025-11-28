import { useState } from "react";
import { toast } from "sonner";
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
  FieldSeparator,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";

interface SignupFormProps extends React.ComponentProps<"div"> {
  onSigninClick?: () => void;
  onSuccess?: () => void;
  onVerifyOtp?: (email: string) => void;
}

export function SignupForm({
  className,
  onSigninClick,
  onSuccess,
  onVerifyOtp,
  ...props
}: SignupFormProps) {
  const t = useTranslations("SignUpForm");
  const { signUp, signInWithProvider, loading, error, setError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [providerLoading, setProviderLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t("passwordMismatchError"));
      return;
    }

    const { data, error } = await signUp(email, password, fullName);

    if (!error) {
      toast.info(t("checkYourEmailForVerification"));
      if (data?.session) {
        onSuccess?.();
      } else {
        onVerifyOtp?.(email);
      }
    }
  };

  const handleProviderSignup = async () => {
    setProviderLoading(true);
    const { error } = await signInWithProvider("github");

    if (!error) {
      onSuccess?.();
    }
    setProviderLoading(false);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <FieldGroup>
              {error && (
                <Alert
                  variant={
                    error.includes("Check your email")
                      ? "default"
                      : "destructive"
                  }
                >
                  <AlertDescription className="justify-center">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <Field>
                <FieldLabel htmlFor="name">{t("fullName")}</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </Field>
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
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      {t("confirmPassword")}
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </Field>
                </Field>
                <FieldDescription className="text-xs">
                  {t("passwordRequirement")}
                </FieldDescription>
              </Field>
              <Field>
                <Button
                  type="submit"
                  className="cursor-pointer"
                  disabled={loading || providerLoading}
                >
                  {loading ? <Spinner /> : null}
                  {loading ? t("creatingAccount") : t("createAccount")}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                {t("orContinueWith")}
              </FieldSeparator>
              <Field className="flex gap-2">
                <Button
                  variant="outline"
                  type="button"
                  className="flex-1 cursor-pointer"
                  disabled={loading || providerLoading}
                  onClick={handleProviderSignup}
                >
                  {providerLoading ? (
                    <Spinner />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                  {t("signUpWithGitHub")}
                </Button>
              </Field>
              <Field>
                <FieldDescription className="text-center">
                  {t("alreadyHaveAccount")}{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onSigninClick?.();
                    }}
                  >
                    {t("signIn")}
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
