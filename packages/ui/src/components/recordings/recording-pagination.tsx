"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useTranslations } from "@workspace/i18n";
import { cn } from "@workspace/ui/lib/utils";
import {
  Pagination,
  PaginationItem,
  PaginationLink,
  PaginationContent,
  PaginationEllipsis,
} from "@workspace/ui/components/pagination";

interface RecordingPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function RecordingPagination({
  currentPage,
  totalPages,
  onPageChange,
}: RecordingPaginationProps) {
  const t = useTranslations("RecordingsPage");

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

  if (totalPages <= 1) return null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
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
                  onPageChange(page as number);
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
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
            size="default"
            className={cn(
              "gap-1 px-2.5 sm:pl-2.5",
              currentPage === totalPages ? "pointer-events-none opacity-50" : ""
            )}
          >
            <span className="hidden sm:block">{t("next")}</span>
            <ChevronRightIcon />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
