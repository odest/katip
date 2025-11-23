import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs";
import { useTranslations } from "@workspace/i18n";
import { SummaryView } from "@workspace/ui/components/transcription/summary-view";
import { ActionsView } from "@workspace/ui/components/transcription/actions-view";

interface TranscriptionTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  TranscriptionView: React.ComponentType<{ onSummarize: () => void }>;
  onSummarize: () => void;
}

export function TranscriptionTabs({
  activeTab,
  setActiveTab,
  TranscriptionView,
  onSummarize,
}: TranscriptionTabsProps) {
  const t = useTranslations("TranscriptionTabs");
  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full h-full gap-0"
    >
      <div className="px-6 pt-6 flex-shrink-0">
        <TabsList className="w-full">
          <TabsTrigger value="transcribe" className="flex-1">
            {t("transcribe")}
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex-1">
            {t("summary")}
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex-1">
            {t("actions")}
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="transcribe" className="flex-1 min-h-0">
        <TranscriptionView onSummarize={onSummarize} />
      </TabsContent>
      <TabsContent value="summary" className="flex-1 min-h-0 pl-6 pb-6">
        <SummaryView />
      </TabsContent>
      <TabsContent value="actions" className="flex-1 min-h-0 pl-6">
        <ActionsView />
      </TabsContent>
    </Tabs>
  );
}
