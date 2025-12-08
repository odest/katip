import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type SortOption =
  | "date_desc"
  | "date_asc"
  | "title_desc"
  | "title_asc"
  | "duration_desc"
  | "duration_asc"
  | "size_desc"
  | "size_asc";

interface SortState {
  sortBy: SortOption;
  setSortBy: (option: SortOption) => void;
}

export const useSortStore = create<SortState>()(
  persist(
    (set) => ({
      sortBy: "date_desc",
      setSortBy: (option) => set({ sortBy: option }),
    }),
    {
      name: "sort-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
