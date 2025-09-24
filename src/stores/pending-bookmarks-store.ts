import { create } from "zustand";

export interface PendingBookmark {
  _id: string;
  link: string;
  platform: string;
  status: string;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

interface PendingStoreState {
  items: Record<string, PendingBookmark>;
  add: (item: PendingBookmark) => void;
  remove: (id: string) => void;
  update: (id: string, partial: Partial<PendingBookmark>) => void;
  clearAll: () => void;
}

export const usePendingBookmarksStore = create<PendingStoreState>((set) => ({
  items: {},
  add: (item) => {
    set((state) => ({ items: { ...state.items, [item._id]: item } }));
    console.log("added item", item);
  },
  remove: (id) =>
    set((state) => {
      const next = { ...state.items };
      delete next[id];
      return { items: next };
    }),
  update: (id, partial) =>
    set((state) => ({
      items: { ...state.items, [id]: { ...state.items[id], ...partial } },
    })),
  clearAll: () => set({ items: {} }),
}));
