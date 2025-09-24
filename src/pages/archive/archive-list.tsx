import { useInfiniteArchives } from "@/hooks/use-archives";
import ArchiveCard from "@/pages/archive/archive-card";
import CreateArchiveDialog from "@/pages/archive/create-archive-dialog";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader2 } from "lucide-react";

const CollectionList = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteArchives({
    q: "",
    limit: 8,
    isDefault: false,
    sortBy: "",
    sortOrder: "",
  });

  const handleNext = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Flatten all pages into a single array
  const collections = data?.pages.flatMap((page) => page.results) ?? [];

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] overflow-auto px-4 custom-scrollbar">
        <div className="space-y-3 pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-full rounded-lg border bg-card animate-pulse"
            >
              <div className="p-4">
                <div className="h-4 bg-muted rounded mb-3" />
                <div className="h-3 bg-muted rounded mb-2 w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] overflow-auto px-4 custom-scrollbar">
        <div className="flex items-center justify-center h-full">
          <div className="text-destructive text-sm text-center">
            Error: {error?.message || "Failed to load collections"}
          </div>
        </div>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] overflow-auto px-4 custom-scrollbar">
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground text-sm text-center">
            No collections found. Create your first collection to get started.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] overflow-auto px-4 custom-scrollbar"
        id="scrollableDiv"
      >
        <InfiniteScroll
          dataLength={collections.length}
          next={handleNext}
          hasMore={hasNextPage || false}
          loader={
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading more collections...
              </span>
            </div>
          }
          endMessage={
            collections.length > 0 ? (
              <div className="text-center py-4">
                {/* <div className="text-xs text-muted-foreground">
                  You've reached the end of your collections
                </div> */}
              </div>
            ) : null
          }
          className="space-y-3 pb-4"
          scrollableTarget="scrollableDiv"
          scrollThreshold={0.8}
          style={{ overflow: "visible" }}
        >
          {collections.map((collection) => (
            <ArchiveCard key={collection._id} archive={collection} />
          ))}
        </InfiniteScroll>
      </div>

      {/* Floating Create Collection Button */}
      <CreateArchiveDialog />
    </>
  );
};

export default CollectionList;
