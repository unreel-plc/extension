import ApiClient from "@/services/api-client";
import { Bookmark, BookmarkCheck, Loader2, X } from "lucide-react";
import { useState } from "react";

interface BookmarkAllTikTokButtonProps {
  onClose?: () => void;
}

export default function BookmarkAllTikTokButton({
  onClose,
}: BookmarkAllTikTokButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const apiClient = new ApiClient("/engine");

  /**
   * Extracts all TikTok video URLs from the favorites page
   */
  const extractFavoriteVideoUrls = (): string[] => {
    // Find all links with href pattern containing /video/
    const links = document.querySelectorAll('a[href*="/video/"]');
    const uniqueUrls = new Set<string>();

    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href.match(/\/@[^/]+\/video\/\d+/)) {
        // Convert relative URL to absolute if needed
        let absoluteUrl = href;
        if (href.startsWith("/")) {
          absoluteUrl = `https://www.tiktok.com${href}`;
        } else if (!href.startsWith("http")) {
          absoluteUrl = `https://www.tiktok.com/${href}`;
        }
        uniqueUrls.add(absoluteUrl);
      }
    });

    return Array.from(uniqueUrls);
  };

  /**
   * Bookmark all favorite videos
   */
  const handleBookmarkAll = async () => {
    const urls = extractFavoriteVideoUrls();

    if (urls.length === 0) {
      return;
    }

    try {
      if (isLoading) return;
      setIsLoading(true);
      await apiClient.post("/bulk-detect", {
        links: urls,
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
    <div className="fixed top-4 right-4 z-[9999] flex gap-2">
      <button
        onClick={handleBookmarkAll}
        disabled={isLoading}
        className="bg-blue-950 hover:bg-blue-900 disabled:bg-blue-950/50 disabled:cursor-not-allowed text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg text-sm"
        title={
          isBookmarked
            ? "All favorites bookmarked"
            : isLoading
            ? "Bookmarking..."
            : "Bookmark all favorites"
        }
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Bookmarking...
          </>
        ) : isBookmarked ? (
          <>
            <BookmarkCheck className="h-4 w-4" />
            Bookmarked
          </>
        ) : (
          <>
            <Bookmark className="h-4 w-4" />
            Bookmark All
          </>
        )}
      </button>
      {onClose && (
        <button
          onClick={onClose}
          className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors shadow-lg"
          aria-label="Close"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
