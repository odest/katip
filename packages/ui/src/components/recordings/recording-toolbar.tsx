import { useState, useEffect } from "react";
import { useTranslations } from "@workspace/i18n";
import {
  Check,
  Search,
  XCircle,
  ArrowUpZA,
  ArrowUpDown,
  ArrowDownAZ,
  CalendarArrowUp,
  HardDriveUpload,
  CalendarArrowDown,
  ArrowUpNarrowWide,
  HardDriveDownload,
  ArrowDownWideNarrow,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@workspace/ui/components/input-group";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@workspace/ui/components/dropdown-menu";
import { Button } from "@workspace/ui/components/button";

interface RecordingToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function RecordingToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: RecordingToolbarProps) {
  const t = useTranslations("RecordingsPage");
  const [inputValue, setInputValue] = useState(searchQuery);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue !== searchQuery) {
        onSearchChange(inputValue);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue, onSearchChange, searchQuery]);

  return (
    <div className="relative flex items-center justify-between gap-2 p-1 border rounded-md bg-card">
      <div className="flex-1">
        <InputGroup>
          <InputGroupAddon>
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder={t("searchPlaceholder")}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            {inputValue && (
              <InputGroupButton
                size="icon-xs"
                onClick={() => {
                  setInputValue("");
                  onSearchChange("");
                }}
              >
                <XCircle className="size-4" />
              </InputGroupButton>
            )}
          </InputGroupAddon>
        </InputGroup>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            <ArrowUpDown className="size-4" />
            {t("sortBy")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={10} className="bg-card">
          <DropdownMenuItem
            onClick={() => onSortChange("date_desc")}
            className={cn(
              "cursor-pointer",
              sortBy === "date_desc" && "bg-accent"
            )}
          >
            <CalendarArrowDown className="size-4 mr-2" />
            {t("sortDateDesc")}
            {sortBy === "date_desc" && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSortChange("date_asc")}
            className={cn(
              "cursor-pointer",
              sortBy === "date_asc" && "bg-accent"
            )}
          >
            <CalendarArrowUp className="size-4 mr-2" />
            {t("sortDateAsc")}
            {sortBy === "date_asc" && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onSortChange("title_asc")}
            className={cn(
              "cursor-pointer",
              sortBy === "title_asc" && "bg-accent"
            )}
          >
            <ArrowDownAZ className="size-4 mr-2" />
            {t("sortTitleAsc")}
            {sortBy === "title_asc" && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSortChange("title_desc")}
            className={cn(
              "cursor-pointer",
              sortBy === "title_desc" && "bg-accent"
            )}
          >
            <ArrowUpZA className="size-4 mr-2" />
            {t("sortTitleDesc")}
            {sortBy === "title_desc" && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onSortChange("duration_desc")}
            className={cn(
              "cursor-pointer",
              sortBy === "duration_desc" && "bg-accent"
            )}
          >
            <ArrowDownWideNarrow className="size-4 mr-2" />
            {t("sortDurationDesc")}
            {sortBy === "duration_desc" && (
              <Check className="h-4 w-4 ml-auto" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSortChange("duration_asc")}
            className={cn(
              "cursor-pointer",
              sortBy === "duration_asc" && "bg-accent"
            )}
          >
            <ArrowUpNarrowWide className="size-4 mr-2" />
            {t("sortDurationAsc")}
            {sortBy === "duration_asc" && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onSortChange("size_desc")}
            className={cn(
              "cursor-pointer",
              sortBy === "size_desc" && "bg-accent"
            )}
          >
            <HardDriveDownload className="size-4 mr-2" />
            {t("sortSizeDesc")}
            {sortBy === "size_desc" && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSortChange("size_asc")}
            className={cn(
              "cursor-pointer",
              sortBy === "size_asc" && "bg-accent"
            )}
          >
            <HardDriveUpload className="size-4 mr-2" />
            {t("sortSizeAsc")}
            {sortBy === "size_asc" && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
