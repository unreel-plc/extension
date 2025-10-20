import { useInfiniteSearchBookmarks, useDetectLink } from "@/hooks/use-engine";
import { useSearchStore } from "@/stores/search-store";
import {
  Heart,
  Copy,
  Check,
  Archive,
  Loader2,
  ExternalLink,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import ArchiveSelectionSheet from "@/components/archive-selection-sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const SearchResults = () => {
  const {
    query,
    platform,
    category,
    limit,
    userPlatform,
    tags,
    sortBy,
    sortOrder,
  } = useSearchStore();

  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [archiveSheetOpen, setArchiveSheetOpen] = useState(false);
  const [selectedBookmarkId, setSelectedBookmarkId] = useState<string | null>(
    null
  );
  const [manualLinkDialogOpen, setManualLinkDialogOpen] = useState(false);
  const [manualLink, setManualLink] = useState("");

  const detectLinkMutation = useDetectLink();

  const copyToClipboard = async (link: string, id: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleAddToArchive = async (
    bookmarkId: string,
    archiveId: string,
    archiveName: string
  ) => {
    try {
      const apiClient = new (await import("@/services/api-client")).default(
        "/archives"
      );
      await apiClient.post(`/${archiveId}/items`, { downloadId: bookmarkId });
      toast.success(`Added to ${archiveName}`);
    } catch (err) {
      console.error("Failed to add to archive: ", err);
      toast.error("Failed to add to collection");
    }
  };

  const openArchiveSheet = (bookmarkId: string) => {
    setSelectedBookmarkId(bookmarkId);
    setArchiveSheetOpen(true);
  };

  const closeArchiveSheet = () => {
    setArchiveSheetOpen(false);
    setSelectedBookmarkId(null);
  };

  const handleManualLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualLink.trim()) {
      toast.error("Please enter a valid link");
      return;
    }

    try {
      const result = await detectLinkMutation.mutateAsync({ link: manualLink });
      toast.success(result.message || "Link added successfully!");
      setManualLink("");
      setManualLinkDialogOpen(false);
    } catch (error) {
      console.error("Failed to detect link:", error);
      toast.error("Failed to process link. Please try again.");
    }
  };

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSearchBookmarks({
    q: query || ".",
    limit,
    platform,
    userPlatform,
    tags,
    categories: category,
    sortBy,
    sortOrder,
  });

  const handleNext = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Flatten all pages into a single array
  const results = data?.pages.flatMap((page) => page.results) ?? [];

  if (isLoading) {
    return (
      <div className="px-4 py-4 columns-2 md:columns-3 lg:columns-4 xl:columns-6 gap-4 [column-fill:_balance]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="mb-4 break-inside-avoid rounded-xl overflow-hidden"
          >
            <div className="relative w-full bg-muted animate-pulse">
              <div className="block w-full aspect-[9/16]" />
            </div>
            <div className="p-2">
              <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
              <div className="mt-2 h-3 w-1/2 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    const message = error instanceof Error ? error.message : "Error";
    return <div className="px-4 py-6 text-sm text-destructive">{message}</div>;
  }

  const formatCount = (num: number) => {
    if (num == null) return "";
    if (num < 1000) return `${num}`;
    if (num < 1_000_000)
      return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
    return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
  };

  if (results.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-muted-foreground text-sm">
        No results
      </div>
    );
  }

  return (
    <div id="scrollableDiv">
      <div className="px-4 py-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {results.map((b) => (
          <div
            key={b._id}
            className="mb-4 break-inside-avoid rounded-3xl p-2 bg-white dark:bg-black shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:ring-black/10 dark:hover:ring-white/20"
          >
            <a
              onClick={(e) => {
                e.preventDefault();
                navigate(`/detail/${b._id}`, { state: b });
              }}
              href={b.link}
              className="group cursor-pointer block rounded-2xl overflow-hidden bg-white/70 dark:bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 dark:hover:bg-white/10"
            >
              <div className="relative">
                <img
                  src={import.meta.env.VITE_BASE_URL + "/" + b.thumbnail}
                  alt={b.title}
                  className="w-full h-auto object-cover aspect-[9/16]"
                  loading="lazy"
                />

                {/* External Link Button - Top Right */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(b.link, "_blank", "noopener,noreferrer");
                  }}
                  className="absolute top-2 right-2 p-2 bg-white/20 hover:bg-black/60 backdrop-blur-md rounded-full transition-all duration-200 active:scale-95 group/external cursor-pointer"
                  title="Open in new tab"
                >
                  <ExternalLink
                    className="h-3 w-3 text-white group-hover/external:scale-110 transition-transform duration-200"
                    strokeWidth={2}
                  />
                </button>

                {/* Overlay */}
                <div className="absolute inset-x-0 -bottom-4 text-white rounded-2xl overflow-hidden">
                  <div className="pointer-events-none bg-[linear-gradient(to_top,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.35)_35%,rgba(0,0,0,0.15)_65%,rgba(0,0,0,0)_100%)] backdrop-blur-sm [mask-image:linear-gradient(to_top,rgba(0,0,0,1)_30%,rgba(0,0,0,0)_100%)] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,1)_30%,rgba(0,0,0,0)_100%)] px-3 pb-4 pt-32 w-full">
                    <div className="pointer-events-auto flex items-center gap-2 text-sm font-semibold leading-tight">
                      <span className="truncate">{b.title}</span>
                      {b.platform === "youtube" && (
                        <img
                          src="https://www.youtube.com/s/desktop/9b55e232/img/favicon_32x32.png"
                          alt="YouTube"
                          className="h-4 w-4 shrink-0 rounded-sm"
                        />
                      )}
                      {b.platform === "tiktok" && (
                        <img
                          src="https://www.tiktok.com/favicon.ico"
                          alt="TikTok"
                          className="h-4 w-4 shrink-0 rounded-full"
                        />
                      )}
                      {b.platform === "instagram" && (
                        <img
                          src="https://static.cdninstagram.com/rsrc.php/v4/yR/r/lam-fZmwmvn.png"
                          alt="Instagram"
                          className="h-4 w-4 shrink-0 rounded-full"
                        />
                      )}
                      {b.platform === "facebook" && (
                        <img
                          src="https://img.icons8.com/color/48/facebook-new.png"
                          alt="Facebook"
                          className="h-4 w-4 shrink-0 rounded-full"
                        />
                      )}
                    </div>
                    <div className="mt-1 text-[11px] md:text-xs text-white/80 truncate pointer-events-auto">
                      {b.channel}
                    </div>
                    <div className="mt-3 flex items-center justify-between pointer-events-auto">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {formatCount(b.likeCount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Add to Archive Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openArchiveSheet(b._id);
                          }}
                          className="group/archive p-2 rounded-full transition-all duration-200 hover:bg-white/20 active:scale-95"
                          title="Add to collection"
                        >
                          <Archive
                            className="h-4 w-4 text-white transition-all duration-200"
                            strokeWidth={2}
                          />
                        </button>

                        {/* Copy Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            copyToClipboard(b.link, b._id);
                          }}
                          className="group/copy p-2 rounded-full transition-all duration-200 hover:bg-white/20 active:scale-95"
                          title={copiedId === b._id ? "Copied!" : "Copy link"}
                        >
                          {copiedId === b._id ? (
                            <Check
                              className="h-4 w-4 text-white transition-all duration-200"
                              strokeWidth={2}
                            />
                          ) : (
                            <Copy
                              className="h-4 w-4 text-white transition-all duration-200"
                              strokeWidth={2}
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center items-center py-6 px-4">
          <Button
            onClick={handleNext}
            disabled={isFetchingNextPage}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}

      {/* Archive Selection Sheet */}
      {selectedBookmarkId && (
        <ArchiveSelectionSheet
          isOpen={archiveSheetOpen}
          onClose={closeArchiveSheet}
          bookmarkId={selectedBookmarkId}
          onArchiveSelect={handleAddToArchive}
        />
      )}

      {/* Floating Action Button - Desktop Only */}
      <button
        onClick={() => setManualLinkDialogOpen(true)}
        className="hidden md:flex fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 group"
        title="Add manual link"
      >
        <Plus className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
      </button>

      {/* Manual Link Dialog - Desktop Only */}
      <Dialog
        open={manualLinkDialogOpen}
        onOpenChange={setManualLinkDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Manual Link</DialogTitle>
            <DialogDescription>
              Enter a link to a video from YouTube, TikTok, Instagram, or
              Facebook to bookmark it.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleManualLinkSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="link">Video Link</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={manualLink}
                  onChange={(e) => setManualLink(e.target.value)}
                  disabled={detectLinkMutation.isPending}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setManualLinkDialogOpen(false);
                  setManualLink("");
                }}
                disabled={detectLinkMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={detectLinkMutation.isPending}>
                {detectLinkMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchResults;
