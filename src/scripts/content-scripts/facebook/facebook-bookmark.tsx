import ApiClient from "@/services/api-client";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
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

export default function FacebookBookmark() {
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
      className="bg-blue-950 text-white rounded-full h-12 w-12 flex items-center justify-center"
    >
      {isLoading ? (
        <Loader2 className="h-10 w-10 text-white animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="h-10 w-10 text-white" />
      ) : (
        <Bookmark className="h-10 w-10 text-white" />
      )}
    </button>
  );
}
