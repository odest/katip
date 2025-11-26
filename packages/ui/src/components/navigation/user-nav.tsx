"use client";

import { ChevronsUpDown, LogIn, LogOut } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useTranslations } from "@workspace/i18n";
import { useUser } from "@workspace/ui/hooks/use-user";
import { useAuthStore } from "@workspace/ui/stores/auth-store";
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

export function UserNav() {
  const { isMobile } = useSidebar();
  const t = useTranslations("Navigation");
  const { user, loading } = useUser();
  const { setOpenDialog, formView, setFormView, setOpenLogoutDialog } =
    useAuthStore();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              disabled={loading}
              className={cn(
                "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                loading ? "!cursor-wait !pointer-events-auto" : "cursor-pointer"
              )}
            >
              <Avatar className="h-8 w-8 rounded-lg items-center justify-center">
                <AvatarImage
                  src={user?.user_metadata?.avatar_url}
                  alt={user?.user_metadata?.full_name || user?.email}
                />
                <AvatarFallback className="rounded-lg">
                  {user?.user_metadata?.full_name
                    .substring(0, 2)
                    .toUpperCase() || t("guest").substring(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user?.user_metadata?.full_name || user?.email || t("guest")}
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
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
