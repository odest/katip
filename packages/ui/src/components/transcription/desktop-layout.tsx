import { SideViews } from "@workspace/ui/components/transcription/side-views";

interface DesktopLayoutProps {
  animateIn: boolean;
  TranscriptionView: React.ComponentType<{ onSummarize: () => void }>;
  onSummarize: () => void;
}

export function DesktopLayout({
  animateIn,
  TranscriptionView,
  onSummarize,
}: DesktopLayoutProps) {
  return (
    <div className="w-full h-full flex flex-row justify-center overflow-y-auto">
      <div
        className={`h-full w-full max-w-3xl transition-all duration-700 ease-in-out ${
          animateIn ? "w-2/3" : "w-full"
        }`}
      >
        <TranscriptionView onSummarize={onSummarize} />
      </div>
      <SideViews animateIn={animateIn} />
    </div>
  );
}
