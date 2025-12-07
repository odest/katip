"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Sparkles, FileAudio } from "lucide-react";
import { useTranslations } from "@workspace/i18n";
import { useRouter } from "@workspace/i18n/navigation";
import { useUser } from "@workspace/ui/hooks/use-user";
import { useRecordings } from "@workspace/ui/hooks/use-recordings";
import { useTranscripts } from "@workspace/ui/hooks/use-transcripts";
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
import { RecordingPagination } from "@workspace/ui/components/recordings/recording-pagination";

export function RecordingsPage() {
  const router = useRouter();
  const t = useTranslations("RecordingsPage");
  const { user } = useUser();
  const { setOpenDialog, formView, setFormView } = useAuthStore();
  const { getPaginatedRecordings, deleteRecording } = useRecordings();
  const { getFirstTranscriptByRecordingId } = useTranscripts();
  const { setTranscriptionState, clearTranscriptionState } =
    useTranscriptionStore();
  const { resetSummary } = useSummaryStore();
  const { setSelectedAudio } = useAudioStore();
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
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

  const handleSynchronizeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (user) {
      // TODO: Implement synchronization logic here
      return;
    }
    formView == "otp" ? setFormView("otp") : setFormView("signin");
    setOpenDialog(true);
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
              <RecordingCard
                key={recording.id}
                recording={recording}
                onCardClick={handleCardClick}
                onSynchronizeClick={handleSynchronizeClick}
                onDeleteClick={handleDeleteClick}
              />
            ))}
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
