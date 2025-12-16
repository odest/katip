"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Cloud,
  Search,
  Sparkles,
  FileCodeIcon,
  FileAudioIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "@workspace/i18n";
import { useRouter } from "@workspace/i18n/navigation";
import { useUser } from "@workspace/ui/hooks/use-user";
import { useSync } from "@workspace/ui/hooks/use-sync";
import { useRecordings } from "@workspace/ui/hooks/use-recordings";
import { useTranscripts } from "@workspace/ui/hooks/use-transcripts";
import { useSortStore } from "@workspace/ui/stores/sort-store";
import { useAuthStore } from "@workspace/ui/stores/auth-store";
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
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { AppFooter } from "@workspace/ui/components/layout/app-footer";
import { EmptyState } from "@workspace/ui/components/common/empty-state";
import { TextShimmer } from "@workspace/ui/components/common/text-shimmer";
import {
  RecordingCard,
  type RecordingItem,
} from "@workspace/ui/components/recordings/recording-card";
import { RecordingToolbar } from "@workspace/ui/components/recordings/recording-toolbar";
import { RecordingPagination } from "@workspace/ui/components/recordings/recording-pagination";

export function RecordingsPage() {
  const router = useRouter();
  const t = useTranslations("RecordingsPage");
  const { user } = useUser();
  const { pushRecording, pullRecordings, pushRecordings, syncAll } = useSync();
  const { setOpenDialog, formView, setFormView } = useAuthStore();
  const { getPaginatedRecordings, deleteRecording, restoreRecording } =
    useRecordings();
  const { getFirstTranscriptByRecordingId } = useTranscripts();
  const { setTranscriptionState, clearTranscriptionState } =
    useTranscriptionStore();
  const { resetSummary } = useSummaryStore();
  const { setSelectedAudio } = useAudioStore();
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { sortBy, setSortBy } = useSortStore();
  const [synchronizing, setSynchronizing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const ITEMS_PER_PAGE = 10;

  const fetchRecordings = useCallback(async () => {
    setLoading(true);
    try {
      const { recordings: data, totalCount: count } =
        await getPaginatedRecordings(
          currentPage,
          ITEMS_PER_PAGE,
          searchQuery,
          sortBy
        );
      setRecordings(data);
      setTotalCount(count);
    } catch (error) {
      console.error("Failed to fetch recordings:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, getPaginatedRecordings, searchQuery, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSynchronizeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (user) {
      setSynchronizing(true);

      const promise = async () => {
        try {
          const { success, error } = await pushRecording(id);
          if (!success) throw error || new Error("Failed to synchronize");
          await fetchRecordings();
        } finally {
          setSynchronizing(false);
        }
      };

      toast.promise(promise(), {
        loading: t("synchronizing"),
        success: t("syncSuccess"),
        error: t("syncError"),
      });

      return;
    }

    formView == "otp" ? setFormView("otp") : setFormView("signin");
    setOpenDialog(true);
  };

  const checkAuthAndSync = async (
    syncFn: () => Promise<{ success: boolean; error?: any }>
  ) => {
    if (!user) {
      formView == "otp" ? setFormView("otp") : setFormView("signin");
      setOpenDialog(true);
      return;
    }

    setSynchronizing(true);
    try {
      const { success, error } = await syncFn();
      if (!success) throw error || new Error("Failed to synchronize");

      toast.success(t("syncAllSuccess"));
      await fetchRecordings();
    } catch (error) {
      console.error("Sync failed:", error);
      toast.error(t("syncAllError"));
    } finally {
      setSynchronizing(false);
    }
  };

  const handleSyncAll = () => checkAuthAndSync(syncAll);
  const handlePushLocal = () => checkAuthAndSync(pushRecordings);
  const handlePullCloud = () => checkAuthAndSync(pullRecordings);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleRestore = async (id: string) => {
    const promise = async () => {
      const { success, error } = await restoreRecording(id);
      if (!success) throw error || new Error("Failed to restore");
      await fetchRecordings();
    };

    toast.promise(promise(), {
      loading: t("processing"),
      success: t("undoSuccess"),
      error: t("undoError"),
    });
  };

  const confirmDelete = async () => {
    if (deleteId) {
      const idToRestore = deleteId;

      const promise = async () => {
        const { success, error } = await deleteRecording(deleteId);
        if (!success) throw error || new Error("Failed to delete");

        clearTranscriptionState();
        resetSummary();
        await fetchRecordings();
        setSelectedAudio(null);
        setDeleteId(null);
        setIsDeleteDialogOpen(false);
      };

      toast.promise(promise(), {
        loading: t("deleting"),
        success: t("deletedSuccess"),
        error: t("failed"),
        action: {
          label: t("undo"),
          onClick: () => handleRestore(idToRestore),
        },
      });
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

  if (!loading && recordings.length === 0 && !searchQuery) {
    return (
      <div className="flex flex-1 justify-center items-center p-6">
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          icons={[FileAudioIcon, Sparkles, FileCodeIcon]}
          action={{
            label: (
              <>
                <Plus />
                {t("startTranscription")}
              </>
            ),
            onClick: () => router.push("/home"),
          }}
          secondaryAction={{
            label: (
              <>
                {synchronizing ? <Spinner /> : <Cloud />}
                {synchronizing ? t("syncing") : t("pullCloud")}
              </>
            ),
            onClick: () => checkAuthAndSync(pullRecordings),
            disabled: synchronizing,
          }}
        />
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="overflow-y-auto w-full flex-1">
        <div className="sticky top-0 z-10 w-full">
          <div
            className="absolute inset-x-0 top-0 h-[calc(100%+32px)] pointer-events-none
                      bg-gradient-to-b from-background/80 to-transparent backdrop-blur-md
                      [mask-image:linear-gradient(to_bottom,black,black,transparent)]
                      [-webkit-mask-image:linear-gradient(to_bottom,black,black,transparent)]"
          />
          <div className="relative p-6">
            <div className="max-w-3xl mx-auto w-full">
              <RecordingToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={(val) => setSortBy(val as any)}
                onSyncAll={handleSyncAll}
                onPush={handlePushLocal}
                onPull={handlePullCloud}
                isSyncing={synchronizing}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 px-6 pb-6">
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
            {recordings.length === 0 ? (
              <div className="flex flex-1 justify-center items-center py-12">
                <EmptyState
                  title={t("noResultsFound")}
                  description={t("tryAdjustingSearch")}
                  icons={[Search]}
                />
              </div>
            ) : (
              recordings.map((recording) => (
                <RecordingCard
                  key={recording.id}
                  recording={recording}
                  synchronizing={synchronizing}
                  onCardClick={handleCardClick}
                  onSynchronizeClick={handleSynchronizeClick}
                  onDeleteClick={handleDeleteClick}
                />
              ))
            )}
          </div>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      {totalPages > 1 && (
        <AppFooter>
          <RecordingPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
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
