"use client";

import {
  Cloud,
  Clock,
  Trash2,
  Calendar,
  HardDrive,
  FileAudio,
  MoreVertical,
} from "lucide-react";
import { cn, formatTimestamp, getBadgeStyles } from "@workspace/ui/lib/utils";
import { useTranslations } from "@workspace/i18n";
import { Recording } from "@workspace/database/schema/sqlite";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@workspace/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

export type RecordingItem = Pick<
  Recording,
  | "id"
  | "title"
  | "filePath"
  | "duration"
  | "fileSize"
  | "status"
  | "isSynced"
  | "createdAt"
>;

interface RecordingCardProps {
  recording: RecordingItem;
  synchronizing: boolean;
  onCardClick: (recording: RecordingItem) => void;
  onSynchronizeClick: (e: React.MouseEvent, id: string) => void;
  onDeleteClick: (e: React.MouseEvent, id: string) => void;
}

export function RecordingCard({
  recording,
  synchronizing,
  onCardClick,
  onSynchronizeClick,
  onDeleteClick,
}: RecordingCardProps) {
  const t = useTranslations("RecordingsPage");

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileName = (path: string) => {
    return path.split(/[\\/]/).pop() || path;
  };

  return (
    <Card
      className="gap-3 cursor-pointer hover:bg-card/90 hover:border-primary/15"
      onClick={() => onCardClick(recording)}
    >
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle>{recording.title}</CardTitle>
          <CardDescription className="flex flex-row items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className={cn(
                    getBadgeStyles(recording.isSynced ? "synced" : "unsynced"),
                    " h-6 w-6 rounded-full border cursor-pointer"
                  )}
                >
                  <Cloud className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{recording.isSynced ? t("synced") : t("unsynced")}</p>
              </TooltipContent>
            </Tooltip>
            <Badge
              variant="outline"
              className={cn(getBadgeStyles(recording.status), " font-mono h-6")}
            >
              {t(recording.status)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  disabled={synchronizing}
                  onClick={(e) => onSynchronizeClick(e, recording.id)}
                >
                  <Cloud />
                  {t("synchronize")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={(e) => onDeleteClick(e, recording.id)}
                >
                  <Trash2 />
                  {t("delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg border">
              <div className="flex items-center justify-center min-w-8 h-8 rounded-md border">
                <FileAudio className="h-4 w-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] tracking-wider text-muted-foreground font-medium">
                  {t("file")}
                </span>
                <span className="text-xs font-medium text-foreground truncate">
                  {getFileName(recording.filePath)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg border">
              <div className="flex items-center justify-center w-8 h-8 rounded-md border">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] tracking-wider text-muted-foreground font-medium">
                  {t("duration")}
                </span>
                <span className="text-xs font-medium text-foreground tabular-nums">
                  {formatTimestamp(recording.duration || 0)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg border">
              <div className="flex items-center justify-center w-8 h-8 rounded-md border">
                <HardDrive className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] tracking-wider text-muted-foreground font-medium">
                  {t("size")}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {formatFileSize(recording.fileSize)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg border">
              <div className="flex items-center justify-center w-8 h-8 rounded-md border">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] tracking-wider text-muted-foreground font-medium">
                  {t("created")}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {recording.createdAt
                    ? new Intl.DateTimeFormat("en-UK", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                      }).format(new Date(recording.createdAt))
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
