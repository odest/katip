"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronsUpDown, LogIn, LogOut } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTranslations } from "@workspace/i18n";
import { useUser } from "@workspace/ui/hooks/use-user";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { OTPForm } from "@workspace/ui/components/auth/otp-form";
import { SigninForm } from "@workspace/ui/components/auth/signin-form";
import { SignupForm } from "@workspace/ui/components/auth/signup-form";

export function UserNav() {
  const { isMobile } = useSidebar();
  const t = useTranslations("Navigation");
  const [view, setView] = useState<"signin" | "signup" | "otp">("signin");
  const [otpEmail, setOtpEmail] = useState("");
  const { user, loading, signOut } = useUser();
  const [open, setOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    await signOut();
    setView("signin");
    setShowLogoutDialog(false);
    toast.success(t("signOutSuccess"));
  };

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="cursor-wait">
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            <div className="grid flex-1 gap-1">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog open={open} onOpenChange={setOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              >
                <Avatar className="h-8 w-8 rounded-lg items-center justify-center">
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url}
                    alt={user?.user_metadata?.full_name || user?.email}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user?.user_metadata?.full_name
                      .substring(0, 2)
                      .toUpperCase() ||
                      t("guest").substring(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user?.user_metadata?.full_name ||
                      user?.email ||
                      t("guest")}
                  </span>
                  <span className="truncate text-xs">
                    {user?.email || t("guestEmail")}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-card"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg items-center justify-center">
                    <AvatarImage
                      src={user?.user_metadata?.avatar_url}
                      alt={user?.user_metadata?.full_name || user?.email}
                    />
                    <AvatarFallback className="rounded-lg">
                      {user?.user_metadata?.full_name
                        .substring(0, 2)
                        .toUpperCase() ||
                        t("guest").substring(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user?.user_metadata?.full_name ||
                        user?.email ||
                        t("guest")}
                    </span>
                    <span className="truncate text-xs">
                      {user?.email || t("guestEmail")}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user ? (
                <DropdownMenuItem
                  onClick={handleLogoutClick}
                  className="cursor-pointer"
                >
                  <LogOut />
                  {t("signOut")}
                </DropdownMenuItem>
              ) : (
                <DialogTrigger asChild className="cursor-pointer">
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <LogIn />
                    {t("signIn")}
                  </DropdownMenuItem>
                </DialogTrigger>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent className="sm:max-w-[425px] p-0 rounded-xl border-none shadow-none">
            <VisuallyHidden asChild>
              <DialogTitle />
            </VisuallyHidden>
            {view === "signin" ? (
              <SigninForm
                onSignupClick={() => setView("signup")}
                onSuccess={() => setOpen(false)}
              />
            ) : view === "signup" ? (
              <SignupForm
                onSigninClick={() => setView("signin")}
                onVerifyOtp={(email) => {
                  setOtpEmail(email);
                  setView("otp");
                }}
                onSuccess={() => setOpen(false)}
              />
            ) : (
              <OTPForm
                email={otpEmail}
                onSuccess={() => {
                  setOpen(false);
                  setView("signin");
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("signOutConfirmTitle")}</DialogTitle>
              <DialogDescription>{t("signOutConfirmDesc")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowLogoutDialog(false)}
              >
                {t("cancel")}
              </Button>
              <Button variant="destructive" onClick={handleConfirmLogout}>
                {t("confirmSignOut")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
