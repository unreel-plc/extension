import ApiClient from "@/services/api-client";
import { BookmarkCheck, BookmarkPlusIcon, Loader2 } from "lucide-react";
import { useState } from "react";

type BookmarkSavedResponse = {
  link: string;
  platform: string;
  status: string;
  progressPercent: number;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export default function TiktokBookmark({ link }: { link: string }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const apiClient = new ApiClient("/engine");

  const handleBookmark = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);
      await apiClient.post<BookmarkSavedResponse>("/detect", {
        link: link,
        platform: "browser_extension",
      });

      setIsBookmarked(true);
    } catch {
      // errors are handled globally by axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={
        isBookmarked ? "Saved" : isLoading ? "Saving" : "Save bookmark"
      }
      onClick={handleBookmark}
      disabled={isLoading}
      title="save to your unreel bookmarks"
      className="group relative mb-4 inline-flex items-center justify-center h-6 w-6"
    >
      {/* Outer glow/ring for elegance */}
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 via-fuchsia-500/10 to-emerald-500/20 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Circular button */}
      <span className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-b from-[#f7f7f7] to-[#ebebeb] dark:from-[#2b2b2b] dark:to-[#1f1f1f] text-[#0e0e0e] dark:text-[#f1f1f1] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_20px_rgba(0,0,0,0.12)] ring-1 ring-black/5 dark:ring-white/5 transition-all duration-300 group-hover:scale-105 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed">
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-blue-500 dark:text-blue-400" />
        ) : isBookmarked ? (
          <BookmarkCheck className="h-6 w-6 text-blue-600 dark:text-blue-400 drop-shadow-sm" />
        ) : (
          <BookmarkPlusIcon className="h-8 w-8 text-white dark:text-white" />
        )}
      </span>
    </button>
  );
}
