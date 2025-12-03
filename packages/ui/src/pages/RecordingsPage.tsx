"use client";

import { useState } from "react";
import {
  FileText,
  Sparkles,
  FileAudio,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useTranslations } from "@workspace/i18n";
import { useRouter } from "@workspace/i18n/navigation";
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@workspace/ui/components/card";
import {
  Pagination,
  PaginationItem,
  PaginationLink,
  PaginationContent,
  PaginationEllipsis,
} from "@workspace/ui/components/pagination";
import { Spinner } from "@workspace/ui/components/spinner";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { AppFooter } from "@workspace/ui/components/layout/app-footer";
import { EmptyState } from "@workspace/ui/components/common/empty-state";
import { TextShimmer } from "@workspace/ui/components/common/text-shimmer";

export function RecordingsPage() {
  const router = useRouter();
  const t = useTranslations("RecordingsPage");
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Mock data for testing
  const allRecordings = Array.from({ length: 125 }).map((_, i) => ({
    id: i,
    title: `Recording ${i + 1}`,
    description: "Test recording description",
  }));
  const totalPages = Math.ceil(allRecordings.length / ITEMS_PER_PAGE);
  const currentRecordings = allRecordings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      setLoading(false);
    }, 250);
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

  if (!loading && !recordings) {
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
            {currentRecordings.map((recording) => (
              <Card key={recording.id}>
                <CardHeader>
                  <CardTitle>{recording.title}</CardTitle>
                  <CardDescription>{recording.description}</CardDescription>
                </CardHeader>
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

              {(() => {
                return getPageNumbers().map((page, index) => {
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
                });
              })()}

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
    </>
  );
}
