"use client";

import { isTauri } from "@tauri-apps/api/core";
import { useTranslations } from "@workspace/i18n";
import { useUser } from "@workspace/ui/hooks/use-user";
import {
  useSettingsStore,
  type SettingsTabs,
} from "@workspace/ui/stores/settings-storage";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  AccountTabSkeleton,
  GuestCardSkeleton,
} from "@workspace/ui/components/settings/settings-card-skeleton";
import { CachedModelsCard } from "@workspace/ui/components/settings/cached-models-card";
import { AIProviderCard } from "@workspace/ui/components/settings/ai-provider-card";
import { LanguageCard } from "@workspace/ui/components/settings/language-card";
import { ModeCard } from "@workspace/ui/components/settings/mode-card";
import { ProfileImageCard } from "@workspace/ui/components/settings/profile-image-card";
import { AccountInfoCard } from "@workspace/ui/components/settings/account-info-card";
import { ChangePasswordCard } from "@workspace/ui/components/settings/change-password-card";
import { DangerZoneCard } from "@workspace/ui/components/settings/danger-zone-card";
import { GuestCard } from "@workspace/ui/components/settings/guest-card";
import { SidebarVariantCard } from "@workspace/ui/components/settings/sidebar-variant-card";
import { ThemesList } from "@workspace/ui/components/settings/themes-list";

export function SettingsPage() {
  const t = useTranslations("SettingsPage");
  const { loading, user } = useUser();
  const { selectedTab, setSelectedTab } = useSettingsStore();

  return (
    <ScrollArea className="overflow-y-auto w-full">
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
          <Tabs
            value={selectedTab}
            onValueChange={(value) => setSelectedTab(value as SettingsTabs)}
          >
            <TabsList className="w-full max-w-3xl mb-4">
              <TabsTrigger value="general">{t("general")}</TabsTrigger>
              <TabsTrigger value="models">{t("models")}</TabsTrigger>
              <TabsTrigger value="account">{t("account")}</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <div className="grid gap-6">
                <LanguageCard />
                <ModeCard />
                <SidebarVariantCard />
                <ThemesList />
              </div>
            </TabsContent>
            <TabsContent value="models">
              <div className="grid gap-6">
                <AIProviderCard />
                {!isTauri() && <CachedModelsCard />}
              </div>
            </TabsContent>
            <TabsContent value="account">
              <div className="grid gap-6">
                {loading ? (
                  user ? (
                    <AccountTabSkeleton />
                  ) : (
                    <GuestCardSkeleton />
                  )
                ) : user ? (
                  <>
                    <ProfileImageCard />
                    <AccountInfoCard />
                    <ChangePasswordCard />
                    <DangerZoneCard />
                  </>
                ) : (
                  <GuestCard />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
