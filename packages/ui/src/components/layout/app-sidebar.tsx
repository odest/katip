"use client";

import * as React from "react";
import { useCallback } from "react";
import { ComponentType } from "react";
import { Biohazard } from "lucide-react";

import { MainNav } from "@workspace/ui/components/navigation/main-nav";
import { SecondaryNav } from "@workspace/ui/components/navigation/secondary-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import { navigationData } from "@workspace/ui/config/navigation";
import { useSidebarStore } from "@workspace/ui/stores/sidebar-store";
import { useMounted } from "@workspace/ui/hooks/use-mounted";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
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

export function AppSidebar({
  pathname,
  LinkComponent = "a",
  ...props
}: AppSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { variant } = useSidebarStore();
  const mounted = useMounted();

  const handleLinkClick = useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  if (!mounted) return <></>;

  return (
    <Sidebar variant={variant} collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <LinkComponent href="/" onClick={handleLinkClick}>
                <Biohazard className="!size-5" />
                <span className="text-base font-semibold">Katip</span>
              </LinkComponent>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <MainNav
          items={navigationData.navMain}
          pathname={pathname}
          LinkComponent={LinkComponent}
        />
        <SecondaryNav
          items={navigationData.navSecondary}
          pathname={pathname}
          LinkComponent={LinkComponent}
          className="mt-auto"
        />
      </SidebarContent>
    </Sidebar>
  );
}
