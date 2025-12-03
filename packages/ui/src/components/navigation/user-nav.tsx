"use client";

import { ComponentType, useCallback } from "react";
import { ChevronsUpDown, LogIn, LogOut, User } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useTranslations } from "@workspace/i18n";
import { useUser } from "@workspace/ui/hooks/use-user";
import { useAuthStore } from "@workspace/ui/stores/auth-store";
import { useSettingsStore } from "@workspace/ui/stores/settings-storage";
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
  DropdownMenuGroup,
} from "@workspace/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar";

interface UserNavProps {
  LinkComponent:
    | ComponentType<{
        href: string;
        children: React.ReactNode;
        onClick?: () => void;
        className?: string;
      }>
    | "a";
}

export function UserNav({ LinkComponent }: UserNavProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { setSelectedTab } = useSettingsStore();
  const t = useTranslations("Navigation");
  const { user, loading, fullName, email, avatarUrl, avatarFallback } =
    useUser();
  const { setOpenDialog, formView, setFormView, setOpenLogoutDialog } =
    useAuthStore();

  const displayName = fullName || t("guest");
  const displayEmail = email || t("guestEmail");
  const displayFallback =
    avatarFallback || t("guest").substring(0, 2).toUpperCase();

  const handleLinkClick = useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
    setSelectedTab("account");
  }, [isMobile, setOpenMobile, setSelectedTab]);

  return (
    <SidebarMenu>
      <SidebarMenuItem className={cn(loading && "cursor-wait")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={loading}>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer",
                loading && "pointer-events-none"
              )}
            >
              <Avatar className="h-8 w-8 rounded-lg items-center justify-center">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="rounded-lg">
                  {displayFallback}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs">{displayEmail}</span>
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
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="rounded-lg">
                    {displayFallback}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs">{displayEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="cursor-pointer">
                <LinkComponent href="/settings" onClick={handleLinkClick}>
                  <User />
                  {t("profile")}
                </LinkComponent>
              </DropdownMenuItem>
              {user ? (
                <DropdownMenuItem
                  onClick={() => setOpenLogoutDialog(true)}
                  className="cursor-pointer"
                >
                  <LogOut />
                  {t("signOut")}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    {
                      formView == "otp"
                        ? setFormView("otp")
                        : setFormView("signin");
                    }
                    setOpenDialog(true);
                  }}
                  className="cursor-pointer"
                >
                  <LogIn />
                  {t("signIn")}
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
