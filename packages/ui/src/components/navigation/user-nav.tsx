"use client";

import { useState } from "react";
import { ChevronsUpDown, LogIn, CircleUser } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTranslations } from "@workspace/i18n";
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
} from "@workspace/ui/components/dialog";
import { SigninForm } from "@workspace/ui/components/common/signin-form";
import { SignupForm } from "@workspace/ui/components/common/signup-form";

interface UserNavUser {
  name: string;
  email: string;
  avatar: string;
}

interface UserNavProps {
  user: UserNavUser;
}

export function UserNav({ user }: UserNavProps) {
  const { isMobile } = useSidebar();
  const t = useTranslations("Navigation");
  const [view, setView] = useState<"signin" | "signup">("signin");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              >
                <Avatar className="h-8 w-8 rounded-lg items-center justify-center">
                  {/* <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">JD</AvatarFallback> */}
                  <CircleUser />
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{t(user.name)}</span>
                  <span className="truncate text-xs">{t(user.email)}</span>
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
                    {/* <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">JD</AvatarFallback> */}
                    <CircleUser />
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{t(user.name)}</span>
                    <span className="truncate text-xs">{t(user.email)}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DialogTrigger asChild className="cursor-pointer">
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <LogIn />
                  {t("signIn")}
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent className="sm:max-w-[425px] p-0 rounded-xl border-none shadow-none">
            <VisuallyHidden asChild>
              <DialogTitle />
            </VisuallyHidden>
            {view === "signin" ? (
              <SigninForm onSignupClick={() => setView("signup")} />
            ) : (
              <SignupForm onSigninClick={() => setView("signin")} />
            )}
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
