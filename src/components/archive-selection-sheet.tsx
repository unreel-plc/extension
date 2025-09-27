import { useState, useEffect, useMemo, useRef } from "react";
import { Loader2, Search } from "lucide-react";
import {
  useCreateArchive,
  type Archive as ArchiveType,
  useInfiniteArchives,
} from "@/hooks/use-archives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ArchiveSelectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkId: string;
  onArchiveSelect: (
    bookmarkId: string,
    archiveId: string,
    archiveName: string
  ) => Promise<void>;
}

const ArchiveSelectionSheet = ({
  isOpen,
  onClose,
  bookmarkId,
  onArchiveSelect,
}: ArchiveSelectionSheetProps) => {
  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const createArchiveMutation = useCreateArchive();

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteArchives({
      q: searchQuery,
      limit: 5,
      isDefault: false,
      sortBy: "",
      sortOrder: "",
    });

  const archives: ArchiveType[] = useMemo(
    () => (data?.pages || []).flatMap((page) => page.results ?? []),
    [data]
  );

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedArchiveId(null);
      setNewCollectionName("");
      setIsCreating(false);
      setSearchQuery("");
    }
  }, [isOpen]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error("Please enter a collection name");
      return;
    }

    try {
      const response = await createArchiveMutation.mutateAsync({
        name: newCollectionName.trim(),
        description: "",
      });

      const newArchive = response.data;

      await onArchiveSelect(bookmarkId, newArchive._id, newArchive.name);
      setNewCollectionName("");
      setIsCreating(false);
      onClose();
    } catch (error) {
      console.error("Failed to create collection:", error);
      toast.error("Failed to create collection");
    }
  };

  const handleArchiveSelect = async (archive: ArchiveType) => {
    setSelectedArchiveId(archive._id);
    await onArchiveSelect(bookmarkId, archive._id, archive.name);
    onClose();
  };

  // Infinite scroll intersection observer
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaId = useMemo(
    () => `scroll-area-${Math.random().toString(36).slice(2)}`,
    []
  );

  useEffect(() => {
    if (!isOpen) return;

    const rootEl = document.getElementById(scrollAreaId);
    if (!rootEl) return;

    const viewport = rootEl.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement | null;

    const sentinel = sentinelRef.current;
    if (!viewport || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: viewport,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    isOpen,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    scrollAreaId,
    data?.pages?.length,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="p-0 gap-0 w-full max-w-sm">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg">Select a Collection</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea id={scrollAreaId} className="max-h-[50vh] px-6 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading collections...
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {archives.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No collections yet</p>
                  <p className="text-xs mt-1">
                    Create your first collection below
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {archives.map((archive: ArchiveType) => (
                    <div
                      key={archive._id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleArchiveSelect(archive)}
                    >
                      <span className="text-sm text-muted-foreground">
                        {archive.name}
                      </span>
                      <div className="w-4 h-4 border-2 border-muted-foreground rounded-full flex items-center justify-center">
                        {selectedArchiveId === archive._id && (
                          <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div ref={sentinelRef} className="h-4" aria-hidden />

              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-xs text-muted-foreground">
                    Loading more...
                  </span>
                </div>
              )}

              {/* {!hasNextPage && archives.length > 0 && (
                <p className="text-[11px] text-center text-muted-foreground py-2">
                  You have reached the end
                </p>
              )} */}
            </div>
          )}
        </ScrollArea>

        <div className="px-6 pb-6">
          <Button
            onClick={() => setIsCreating(true)}
            className="w-full mt-2 bg-muted hover:bg-muted/80 text-muted-foreground"
            variant="outline"
          >
            Add New Collection
          </Button>

          {isCreating && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/30">
              <Input
                placeholder="Collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateCollection();
                  } else if (e.key === "Escape") {
                    setIsCreating(false);
                    setNewCollectionName("");
                  }
                }}
                autoFocus
                className="mb-3"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateCollection}
                  disabled={
                    createArchiveMutation.isPending || !newCollectionName.trim()
                  }
                  className="flex-1"
                >
                  {createArchiveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setNewCollectionName("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center mt-4">
            Save and share your favorite videos
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveSelectionSheet;
