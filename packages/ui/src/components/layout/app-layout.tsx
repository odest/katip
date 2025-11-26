import { ReactNode, ComponentType } from "react";
import { toast } from "sonner";
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
import { AppSidebar } from "@workspace/ui/components/layout/app-sidebar";
import { AppHeader } from "@workspace/ui/components/layout/app-header";
import { OTPForm } from "@workspace/ui/components/auth/otp-form";
import { SigninForm } from "@workspace/ui/components/auth/signin-form";
import { SignupForm } from "@workspace/ui/components/auth/signup-form";

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
  } = useAuthStore();

  const handleConfirmLogout = async () => {
    await signOut();
    setFormView("signin");
    setOpenLogoutDialog(false);
    toast.success(t("signOutSuccess"));
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
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[425px] p-0 rounded-xl border-none shadow-none">
            <VisuallyHidden asChild>
              <DialogTitle />
            </VisuallyHidden>
            {formView === "signin" ? (
              <SigninForm
                onSignupClick={() => setFormView("signup")}
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
            ) : (
              <OTPForm
                email={otpEmail}
                onSuccess={() => {
                  setOtpEmail("");
                  setOpenDialog(false);
                  setFormView("signin");
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
                onClick={handleConfirmLogout}
              >
                {t("confirmSignOut")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarProvider>
    </ThemeProvider>
  );
}
