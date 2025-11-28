import { ReactNode, ComponentType, useState } from "react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { useTranslations } from "@workspace/i18n";
import { useUser } from "@workspace/ui/hooks/use-user";
import { useAuthStore } from "@workspace/ui/stores/auth-store";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ThemeProvider } from "@workspace/ui/providers/theme-provider";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { AppSidebar } from "@workspace/ui/components/layout/app-sidebar";
import { AppHeader } from "@workspace/ui/components/layout/app-header";
import { OTPForm } from "@workspace/ui/components/auth/otp-form";
import { SigninForm } from "@workspace/ui/components/auth/signin-form";
import { SignupForm } from "@workspace/ui/components/auth/signup-form";
import { ResetPasswordForm } from "@workspace/ui/components/auth/reset-password-form";
import { ForgotPasswordForm } from "@workspace/ui/components/auth/forgot-password-form";

interface AppLayoutProps {
  children: ReactNode;
  pathname: string;
  LinkComponent?:
    | ComponentType<{
        href: string;
        children: React.ReactNode;
        onClick?: () => void;
        className?: string;
      }>
    | "a";
}

export function AppLayout({
  children,
  pathname,
  LinkComponent,
}: AppLayoutProps) {
  const t = useTranslations("Navigation");
  const { signOut } = useUser();
  const {
    formView,
    setFormView,
    openDialog,
    setOpenDialog,
    openLogoutDialog,
    setOpenLogoutDialog,
    otpEmail,
    setOtpEmail,
    otpType,
    setOtpType,
  } = useAuthStore();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsSigningOut(true);
    await signOut();
    setFormView("signin");
    setOpenLogoutDialog(false);
    toast.success(t("signOutSuccess"));
    setIsSigningOut(false);
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <SidebarProvider className="h-screen">
        <AppSidebar pathname={pathname} LinkComponent={LinkComponent} />
        <SidebarInset>
          <AppHeader pathname={pathname} LinkComponent={LinkComponent} />
          {children}
        </SidebarInset>
        <Dialog
          open={openDialog}
          onOpenChange={(open) => {
            if ((formView === "otp" || formView === "reset-password") && !open)
              return;
            setOpenDialog(open);
          }}
        >
          <DialogContent className="sm:max-w-[425px] p-0 rounded-xl border-none shadow-none">
            <VisuallyHidden asChild>
              <DialogTitle />
            </VisuallyHidden>
            {formView === "signin" ? (
              <SigninForm
                onSignupClick={() => setFormView("signup")}
                onForgotPasswordClick={() => setFormView("forgot-password")}
                onSuccess={() => setOpenDialog(false)}
              />
            ) : formView === "signup" ? (
              <SignupForm
                onSigninClick={() => setFormView("signin")}
                onVerifyOtp={(email) => {
                  setOtpEmail(email);
                  setFormView("otp");
                }}
                onSuccess={() => {
                  setOtpEmail("");
                  setFormView("signin");
                  setOpenDialog(false);
                }}
              />
            ) : formView === "forgot-password" ? (
              <ForgotPasswordForm
                onBackToSignin={() => setFormView("signin")}
                onVerifyOtp={(email) => {
                  setOtpEmail(email);
                  setOtpType("recovery");
                  setFormView("otp");
                }}
              />
            ) : formView === "reset-password" ? (
              <ResetPasswordForm
                onSuccess={() => {
                  setOpenDialog(false);
                  setFormView("signin");
                }}
              />
            ) : (
              <OTPForm
                email={otpEmail}
                type={otpType}
                onSuccess={() => {
                  if (otpType === "recovery") {
                    setFormView("reset-password");
                  } else {
                    setOtpEmail("");
                    setOtpType("signup");
                    setOpenDialog(false);
                    setFormView("signin");
                  }
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={openLogoutDialog} onOpenChange={setOpenLogoutDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("signOutConfirmTitle")}</DialogTitle>
              <DialogDescription>{t("signOutConfirmDesc")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => setOpenLogoutDialog(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="destructive"
                className="cursor-pointer"
                disabled={isSigningOut}
                onClick={handleConfirmLogout}
              >
                {isSigningOut ? <Spinner /> : <LogOut />}
                {t("confirmSignOut")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarProvider>
    </ThemeProvider>
  );
}
