import { TranscriptionTabs } from "@workspace/ui/components/transcription/transcription-tabs";

interface MobileLayoutProps {
  showSideViews: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  TranscriptionView: React.ComponentType<{ onSummarize: () => void }>;
  onSummarize: () => void;
}

export function MobileLayout({
  showSideViews,
  activeTab,
  setActiveTab,
  TranscriptionView,
  onSummarize,
}: MobileLayoutProps) {
  return (
    <div className="w-full h-full max-w-3xl mx-auto flex flex-col overflow-y-auto">
      {!showSideViews ? (
        <TranscriptionView onSummarize={onSummarize} />
      ) : (
        <TranscriptionTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          TranscriptionView={TranscriptionView}
          onSummarize={onSummarize}
        />
      )}
    </div>
  );
}
