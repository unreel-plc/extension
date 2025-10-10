import { create } from "zustand";
import { type DownloadProgressData } from "@/hooks/use-websocket";

export interface Download {
  downloadId: string;
  status: "queued" | "processing" | "completed" | "failed";
  progressPercent: number;
  message?: string;
  metadata?: {
    title?: string;
    thumbnail?: string;
    platform?: string;
    duration?: number;
  };
  timestamp: number;
}

interface DownloadProgressState {
  downloads: Map<string, Download>;
  addOrUpdateDownload: (data: DownloadProgressData) => void;
  removeDownload: (downloadId: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
}

export const useDownloadProgressStore = create<DownloadProgressState>(
  (set) => ({
    downloads: new Map(),

    addOrUpdateDownload: (data: DownloadProgressData) => {
      set((state) => {
        const updated = new Map(state.downloads);
        updated.set(data.downloadId, {
          downloadId: data.downloadId,
          status: data.status,
          progressPercent: data.progressPercent,
          message: data.message,
          metadata: data.metadata,
          timestamp: Date.now(),
        });
        return { downloads: updated };
      });
    },

    removeDownload: (downloadId: string) => {
      set((state) => {
        const updated = new Map(state.downloads);
        updated.delete(downloadId);
        return { downloads: updated };
      });
    },

    clearCompleted: () => {
      set((state) => {
        const updated = new Map(state.downloads);
        for (const [id, download] of updated.entries()) {
          if (download.status === "completed" || download.status === "failed") {
            updated.delete(id);
          }
        }
        return { downloads: updated };
      });
    },

    clearAll: () => {
      set({ downloads: new Map() });
    },
  })
);
