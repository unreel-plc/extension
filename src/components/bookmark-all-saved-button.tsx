import ApiClient from "@/services/api-client";
import { Bookmark, BookmarkCheck, Loader2, X } from "lucide-react";
import { useState } from "react";

interface BookmarkAllSavedButtonProps {
  onClose?: () => void;
}

export default function BookmarkAllSavedButton({
  onClose,
}: BookmarkAllSavedButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const apiClient = new ApiClient("/engine");
  /**
   * Extracts all Instagram post URLs from the saved page
   */
  const extractSavedPostUrls = (): string[] => {
    // Find all links with href pattern /p/{post-id}/
    const links = document.querySelectorAll('a[href^="/p/"]');
    const uniqueUrls = new Set<string>();

    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href.match(/^\/p\/[^/]+\/$/)) {
        // Convert relative URL to absolute
        const absoluteUrl = `https://www.instagram.com${href}`;
        uniqueUrls.add(absoluteUrl);
      }
    });

    return Array.from(uniqueUrls);
  };

  /**
   * Extract and log all saved post URLs
   */
  const handleExtractUrls = async () => {
    const urls = extractSavedPostUrls();

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
        onClick={handleExtractUrls}
        disabled={isLoading}
        className="font-medium py-2 px-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg text-sm disabled:cursor-not-allowed"
        style={{
          backgroundColor: isLoading
            ? "oklch(0.55 0.12 25 / 0.5)"
            : "oklch(0.55 0.12 25)",
          color: "oklch(0.98 0.01 90)",
        }}
        title={
          isBookmarked
            ? "All saved posts bookmarked"
            : isLoading
            ? "Bookmarking..."
            : "Bookmark all saved posts"
        }
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = "oklch(0.50 0.12 25)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = "oklch(0.55 0.12 25)";
          }
        }}
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
          className="p-2 rounded-lg transition-colors shadow-lg"
          style={{
            backgroundColor: "oklch(0.88 0.01 95)",
            color: "oklch(0.38 0.02 60)",
          }}
          aria-label="Close"
          title="Close"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "oklch(0.82 0.01 95)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "oklch(0.88 0.01 95)";
          }}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
