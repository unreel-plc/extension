import { Link, useLocation, useParams } from "react-router-dom";
import { useInfiniteArchiveItems } from "@/hooks/use-archives";
import { useArchiveSearchStore } from "@/stores/archive-search-store";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader2, Heart, BadgeCheck, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Archive } from "@/hooks/use-archives";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const ArchiveDetail = () => {
  const { id: archiveId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const archiveState = (location.state as Archive | undefined) || undefined;
  const archiveName = archiveState?.name || archiveId || "";

  // Get search filters from archive search store
  const { query, platform, category, limit, tags, sortBy, sortOrder } =
    useArchiveSearchStore();

  const copyToClipboard = async (link: string, id: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
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
  } = useInfiniteArchiveItems({
    archiveId: archiveId || "",
    q: query,
    limit,
    platform,
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
  const archiveItems = data?.pages.flatMap((page) => page.results) ?? [];

  const formatCount = (num: number) => {
    if (num == null) return "";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (isLoading) {
    return (
      <div>
        <div className="px-4 pt-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/archive">Collections</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{archiveName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
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
      </div>
    );
  }

  if (isError) {
    const message = error instanceof Error ? error.message : "Error";
    return (
      <div>
        <div className="px-4 pt-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/archive">Collections</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{archiveName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="px-4 py-6 text-sm text-destructive">{message}</div>
      </div>
    );
  }

  if (archiveItems.length === 0) {
    return (
      <div>
        <div className="px-4 pt-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/archive">Collections</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{archiveName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="px-4 py-6 text-sm text-muted-foreground text-center">
          {query
            ? "No items found matching your search."
            : "This collection is empty."}
        </div>
      </div>
    );
  }

  return (
    <div id="scrollableDiv">
      <div className="px-4 pt-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/archive">Collections</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{archiveName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <InfiniteScroll
        dataLength={archiveItems.length}
        next={handleNext}
        hasMore={hasNextPage || false}
        loader={
          <div className="col-span-full flex justify-center items-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading more items...
            </span>
          </div>
        }
        className="px-4 py-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
        scrollableTarget="scrollableDiv"
        scrollThreshold={0.8}
        style={{ overflow: "visible" }}
      >
        {archiveItems.map((b) => (
          <div
            key={b._id}
            className="mb-4 break-inside-avoid rounded-3xl p-2 bg-white dark:bg-black shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:ring-black/10 dark:hover:ring-white/20"
          >
            <a
              onClick={(e) => {
                e.preventDefault();
                window.open(b.link, "_blank", "noopener,noreferrer");
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
                {/* Overlay */}
                <div className="absolute inset-x-0 bottom-0 text-white rounded-2xl overflow-hidden">
                  <div className="pointer-events-none bg-[linear-gradient(to_top,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.35)_35%,rgba(0,0,0,0.15)_65%,rgba(0,0,0,0)_100%)] backdrop-blur-sm [mask-image:linear-gradient(to_top,rgba(0,0,0,1)_30%,rgba(0,0,0,0)_100%)] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,1)_30%,rgba(0,0,0,0)_100%)] px-3 pb-4 pt-32 w-full">
                    <div className="pointer-events-auto flex items-center gap-2 text-sm font-semibold leading-tight">
                      <span className="truncate">{b.title}</span>
                      <BadgeCheck className="h-4 w-4 shrink-0 text-white/80" />
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
                        {/* <button
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
                        </button> */}

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
      </InfiniteScroll>
    </div>
  );
};

export default ArchiveDetail;
