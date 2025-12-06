"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Trash2,
  Calendar,
  FileText,
  Sparkles,
  HardDrive,
  FileAudio,
  MoreVertical,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { cn, formatTimestamp, getBadgeStyles } from "@workspace/ui/lib/utils";
import { useTranslations } from "@workspace/i18n";
import { useRouter } from "@workspace/i18n/navigation";
import { Recording } from "@workspace/database/schema/sqlite";
import { useRecordings } from "@workspace/ui/hooks/use-recordings";
import { useTranscripts } from "@workspace/ui/hooks/use-transcripts";
import { useAudioStore } from "@workspace/ui/stores/audio-store";
import { useSummaryStore } from "@workspace/ui/stores/summary-store";
import { useTranscriptionStore } from "@workspace/ui/stores/transcription-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@workspace/ui/components/card";
import {
  Pagination,
  PaginationItem,
  PaginationLink,
  PaginationContent,
  PaginationEllipsis,
} from "@workspace/ui/components/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { AppFooter } from "@workspace/ui/components/layout/app-footer";
import { EmptyState } from "@workspace/ui/components/common/empty-state";
import { TextShimmer } from "@workspace/ui/components/common/text-shimmer";

export function RecordingsPage() {
  const router = useRouter();
  const t = useTranslations("RecordingsPage");
  const { getPaginatedRecordings, deleteRecording } = useRecordings();
  const { getFirstTranscriptByRecordingId } = useTranscripts();
  const { setTranscriptionState, clearTranscriptionState } =
    useTranscriptionStore();
  const { resetSummary } = useSummaryStore();
  const { setSelectedAudio } = useAudioStore();
  const [recordings, setRecordings] = useState<
    Pick<
      Recording,
      | "id"
      | "title"
      | "filePath"
      | "duration"
      | "fileSize"
      | "status"
      | "createdAt"
    >[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const ITEMS_PER_PAGE = 10;

  const fetchRecordings = useCallback(async () => {
    setLoading(true);
    try {
      const { recordings: data, totalCount: count } =
        await getPaginatedRecordings(currentPage, ITEMS_PER_PAGE);
      setRecordings(data);
      setTotalCount(count);
    } catch (error) {
      console.error("Failed to fetch recordings:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, getPaginatedRecordings]);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteRecording(deleteId);
      clearTranscriptionState();
      resetSummary();
      fetchRecordings();
      setSelectedAudio(null);
      setDeleteId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleCardClick = async (recording: (typeof recordings)[0]) => {
    try {
      const transcript = await getFirstTranscriptByRecordingId(recording.id);

      if (transcript) {
        setTranscriptionState({ recordingId: recording.id });
        router.push("/transcribe");
      } else {
        console.error("No transcript found for recording:", recording.id);
      }
    } catch (error) {
      console.error("Failed to navigate to recording:", error);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis-start");
      }

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      }

      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-end");
      }

      pages.push(totalPages);
    }
    return pages;
  };

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

  if (loading) {
    return (
      <div className="flex flex-1 flex-col justify-center items-center p-6 gap-4">
        <Spinner className="size-8" />
        <TextShimmer className="font-mono" duration={1}>
          {t("loading")}
        </TextShimmer>
      </div>
    );
  }

  if (!loading && recordings.length === 0) {
    return (
      <div className="flex flex-1 justify-center items-center p-6">
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          icons={[FileAudio, Sparkles, FileText]}
          action={{
            label: t("startTranscription"),
            onClick: () => router.push("/"),
          }}
        />
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="overflow-y-auto w-full flex-1">
        <div className="flex flex-col gap-6 p-6">
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
            {recordings.map((recording) => (
              <Card
                key={recording.id}
                className="gap-3 cursor-pointer hover:bg-card/90 hover:border-primary/15"
                onClick={() => handleCardClick(recording)}
              >
                <CardHeader>
                  <div className="flex flex-row items-center justify-between">
                    <CardTitle>{recording.title}</CardTitle>
                    <CardDescription className="flex flex-row items-center gap-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          getBadgeStyles(recording.status),
                          " font-mono"
                        )}
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
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={(e) => handleDeleteClick(e, recording.id)}
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
            ))}
          </div>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      {totalPages > 1 && (
        <AppFooter>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  size="default"
                  className={cn(
                    "gap-1 px-2.5 sm:pl-2.5",
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  )}
                >
                  <ChevronLeftIcon />
                  <span className="hidden sm:block">{t("previous")}</span>
                </PaginationLink>
              </PaginationItem>

              {getPageNumbers().map((page, index) => {
                if (page === "ellipsis-start" || page === "ellipsis-end") {
                  return (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page as number);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      handlePageChange(currentPage + 1);
                  }}
                  size="default"
                  className={cn(
                    "gap-1 px-2.5 sm:pl-2.5",
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  )}
                >
                  <span className="hidden sm:block">{t("next")}</span>
                  <ChevronRightIcon />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </AppFooter>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteConfirmationTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteConfirmationDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={confirmDelete}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
