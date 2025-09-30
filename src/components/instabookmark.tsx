import ApiClient from "@/services/api-client";
import { BookmarkCheck, BookmarkPlus, Loader2 } from "lucide-react";
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

export default function InstaBookmarkButton() {
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
      title={
        isBookmarked
          ? "Saved to unreel bookmarks"
          : "save to your unreel bookmarks"
      }
      className=" mb-4 inline-flex items-center justify-center h-8 w-8 bg-blue-950"
    >
      {/* Outer glow/ring for elegance */}

      {/* Circular button with elegant glassmorphism effect */}
      <span className="relative w-12 h-12 rounded-full flex items-center justify-center  ">
        {/* Inner highlight for extra depth */}

        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-black " />
        ) : isBookmarked ? (
          <BookmarkCheck className="h-8 w-8 text-black" />
        ) : (
          <BookmarkPlus className="h-8 w-8 text-black" />
        )}
      </span>
    </button>
  );
}
