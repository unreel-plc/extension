import ApiClient from "@/services/api-client";
import { Bookmark, BookmarkPlus, Loader2 } from "lucide-react";
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

export default function BookmarkButton() {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const apiClient = new ApiClient("/engine");

  const handleBookmark = async () => {
    const url = window.location.href;
    try {
      if (isLoading) return;
      setIsLoading(true);
      await apiClient.post<BookmarkSavedResponse>("/detect", {
        link: url,
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
      className="group relative mb-4 inline-flex items-center justify-center h-8 w-8"
    >
      {/* Outer glow/ring for elegance */}
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/30 blur-sm opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:blur-md" />

      {/* Circular button with elegant glassmorphism effect */}
      <span
        className="relative w-8 h-8 rounded-full flex items-center justify-center 
        bg-gradient-to-br from-white/90 to-white/70 
        dark:from-gray-800/90 dark:to-gray-900/70
        backdrop-blur-sm
        shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] 
        dark:shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
        ring-1 ring-white/20 dark:ring-white/10
        transition-all duration-300 
        group-hover:scale-110 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.3)]
        dark:group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]
        active:scale-95 
        disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
      >
        {/* Inner highlight for extra depth */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
        ) : isBookmarked ? (
          <BookmarkPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        ) : (
          <Bookmark className="h-4 w-4 text-gray-700 dark:text-gray-300" />
        )}
      </span>
    </button>
  );
}
