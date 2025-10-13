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
      title={
        isBookmarked
          ? "Saved to unreel bookmarks"
          : "save to your unreel bookmarks"
      }
      className="bg-blue-950 text-white rounded-full h-14 w-14 flex items-center justify-center"
    >
      {isLoading ? (
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="h-8 w-8 text-white" />
      ) : (
        <Bookmark className="h-8 w-8 text-white" />
      )}
    </button>
  );
}
