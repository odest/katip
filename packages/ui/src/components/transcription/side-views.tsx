import { SummaryView } from "@workspace/ui/components/transcription/summary-view";
import { ActionsView } from "@workspace/ui/components/transcription/actions-view";

interface SideViewsProps {
  animateIn: boolean;
}

export function SideViews({ animateIn }: SideViewsProps) {
  return (
    <div
      className={`h-full flex flex-col transition-all duration-700 ease-in-out ${
        animateIn
          ? "w-1/3 opacity-100 translate-x-0"
          : "w-0 opacity-0 translate-x-4"
      }`}
    >
      <div className="flex-1 h-1/2">
        <SummaryView />
      </div>
      <div className="flex-1 h-1/2">
        <ActionsView />
      </div>
    </div>
  );
}
