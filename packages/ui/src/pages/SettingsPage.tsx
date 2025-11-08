import { isTauri } from "@tauri-apps/api/core";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { CachedModelsCard } from "@workspace/ui/components/settings/cached-models-card";
import { LanguageCard } from "@workspace/ui/components/settings/language-card";
import { ModeCard } from "@workspace/ui/components/settings/mode-card";
import { SidebarVariantCard } from "@workspace/ui/components/settings/sidebar-variant-card";
import { ThemesList } from "@workspace/ui/components/settings/themes-list";
import { useTranslations } from "@workspace/i18n";

export function SettingsPage() {
  const t = useTranslations("SettingsPage");

  return (
    <ScrollArea className="overflow-y-auto w-full">
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>

          {isTauri() && (
            <div className="grid gap-6">
              <LanguageCard />
              <ModeCard />
              <SidebarVariantCard />
              <ThemesList />
            </div>
          )}

          {!isTauri() && (
            <Tabs defaultValue="general">
              <TabsList className="w-full max-w-3xl mb-4">
                <TabsTrigger value="general">{t("general")}</TabsTrigger>
                <TabsTrigger value="models">{t("models")}</TabsTrigger>
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
                  <CachedModelsCard />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
