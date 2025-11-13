import { Segment } from "@workspace/ui/stores/transcription-store";
import { formatTimestamp } from "@workspace/ui/lib/utils";

interface SegmentListProps {
  segments: Segment[];
  emptyMessage: string;
  isCentiseconds: boolean;
  onSegmentChange: (index: number, newText: string) => void;
}

export const SegmentList = ({
  segments,
  emptyMessage,
  isCentiseconds,
  onSegmentChange,
}: SegmentListProps) => {
  if (segments.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        {emptyMessage}
      </div>
    );
  }

  const handleSegmentChange = (
    index: number,
    e: React.FocusEvent<HTMLDivElement>
  ) => {
    const newText = e.currentTarget.innerText;
    if (segments[index]?.text !== newText) {
      onSegmentChange(index, newText);
    }
  };

  return (
    <>
      {segments.map((segment, index) => (
        <div
          key={index}
          className="flex gap-4 items-start hover:bg-muted/50 rounded-md p-2 transition-colors"
        >
          <div className="text-xs text-muted-foreground/70 font-mono pt-1">
            {isCentiseconds
              ? formatTimestamp(segment.start / 100)
              : formatTimestamp(segment.start)}
          </div>
          <div
            className="flex-1 text-sm leading-relaxed"
            contentEditable="true"
            suppressContentEditableWarning={true}
            onBlur={(e) => handleSegmentChange(index, e)}
          >
            {segment.text}
          </div>
        </div>
      ))}
    </>
  );
};
