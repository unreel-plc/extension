import { create } from "zustand";

interface SearchState {
  query: string;
  platform: string;
  category: string;
  page: number;
  limit: number;
  userPlatform: string;
  tags: string;
  sortBy: string;
  sortOrder: string;
  setQuery: (query: string) => void;
  setPlatform: (platform: string) => void;
  setCategory: (category: string) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setUserPlatform: (userPlatform: string) => void;
  setTags: (tags: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: string) => void;
  resetFilters: () => void;
  setAll: (
    params: Partial<
      Omit<
        SearchState,
        | "setQuery"
        | "setPlatform"
        | "setCategory"
        | "setPage"
        | "setLimit"
        | "setUserPlatform"
        | "setTags"
        | "setSortBy"
        | "setSortOrder"
        | "resetFilters"
        | "setAll"
      >
    >
  ) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  platform: "",
  category: "",
  page: 1,
  limit: 10,
  userPlatform: "",
  tags: "",
  sortBy: "",
  sortOrder: "",
  setQuery: (query) => set({ query }),
  setPlatform: (platform) => set({ platform }),
  setCategory: (category) => set({ category }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit }),
  setUserPlatform: (userPlatform) => set({ userPlatform }),
  setTags: (tags) => set({ tags }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  resetFilters: () => set({ platform: "", category: "", tags: "" }),
  setAll: (params) => set(params),
}));
