import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useGetCategories } from "@/hooks/use-engine";
import {
  Youtube,
  Instagram,
  Music2,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useSearchStore } from "@/stores/search-store";
import { useArchiveSearchStore } from "@/stores/archive-search-store";
import { useNavigate, useLocation } from "react-router-dom";

type SearchBookmarkInputProps = {
  onToggleDesktopSidebar?: () => void;
  isDesktopSidebarOpen?: boolean;
};

const SearchBookmarkInput = ({
  onToggleDesktopSidebar,
  isDesktopSidebarOpen,
}: SearchBookmarkInputProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Local input state with debounce, committed into the store
  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDebounce(inputValue, 300);

  // Determine if we're in archive detail route
  const isArchiveDetailRoute =
    location.pathname.startsWith("/archive/") &&
    location.pathname !== "/archive";

  // Use appropriate store based on route
  const bookmarkStore = useSearchStore();
  const archiveStore = useArchiveSearchStore();

  const { query, platform, category, setQuery, setPlatform, setCategory } =
    isArchiveDetailRoute ? archiveStore : bookmarkStore;

  useEffect(() => {
    if (debouncedValue.trim() !== query) {
      setQuery(debouncedValue.trim());
    }
  }, [debouncedValue, query, setQuery]);

  // Sync input value with store when route changes
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 1);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", update as EventListener);
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, []);

  const { data: categories } = useGetCategories();

  // Platform filter badges
  const platformFilters = [
    {
      id: "youtube",
      label: "Shorts",
      icon: <Youtube className="h-4 w-4" />,
    },
    {
      id: "instagram",
      label: "Reels",
      icon: <Instagram className="h-4 w-4" />,
    },
    {
      id: "tiktok",
      label: "TikTok",
      icon: <Music2 className="h-4 w-4" />,
    },
  ];

  return (
    <div className="w-full space-y-3">
      {/* Search Input + Desktop hamburger + Mobile theme toggle */}
      <div className="relative rounded-xl flex items-center gap-2">
        {/* Desktop hamburger */}
        <button
          type="button"
          className="hidden md:inline-flex items-center justify-center rounded-md border border-border hover:bg-muted h-9 w-9"
          aria-label={isDesktopSidebarOpen ? "Hide sidebar" : "Show sidebar"}
          onClick={onToggleDesktopSidebar}
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="pointer-events-none absolute left-3 md:left-[3.25rem] top-1/2 -translate-y-1/2 text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
        </span>
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            // Navigate to appropriate route based on current location
            if (isArchiveDetailRoute) {
              // Stay in archive detail route when searching within archive
              // Don't navigate, just update the search
            } else {
              // Navigate to home for general bookmark search
              navigate("/");
            }
          }}
          placeholder={
            isArchiveDetailRoute
              ? "Search within this collection..."
              : "Search videos, tags, creators..."
          }
          className="pl-9 md:pl-14 pr-4 h-10 rounded-xl bg-[#f3f4f6] dark:bg-input/30 outline-none focus:outline-none focus-visible:outline-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-0 border-transparent focus:border-0 focus:border-transparent focus-visible:border-0 focus-visible:border-transparent shadow-none flex-1"
        />
        {/* Mobile-only theme toggle */}
        <div className="md:hidden">
          <ModeToggle />
        </div>
      </div>

      {/* Filter Badges - one-line horizontal scroll with controls */}
      <div className="relative">
        {/* Left Scroll Control (only after scrolling right) */}
        {canScrollLeft && (
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => {
              scrollContainerRef.current?.scrollBy({
                left: -240,
                behavior: "smooth",
              });
            }}
            className="absolute left-0 inset-y-0 z-20 grid place-items-center w-8 text-muted-foreground hover:text-foreground bg-white dark:bg-zinc-900/85 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden  pr-6"
        >
          {/* Platform Filters */}
          {platformFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => {
                const next = platform === filter.id ? "" : filter.id;
                setPlatform(next);
                if (next) setCategory("");
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                platform === filter.id
                  ? "bg-primary/15 text-primary dark:bg-primary/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 dark:hover:bg-muted/60"
              }`}
            >
              {filter.icon}
              {filter.label}
            </button>
          ))}

          {/* Category Filters */}
          {categories?.map((c) => (
            <button
              key={c}
              onClick={() => {
                const next = category === c ? "" : c;
                setCategory(next);
                if (next) setPlatform("");
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === c
                  ? "bg-primary/15 text-primary dark:bg-primary/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 dark:hover:bg-muted/60"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Right Scroll Control */}
        {canScrollRight && (
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => {
              scrollContainerRef.current?.scrollBy({
                left: 240,
                behavior: "smooth",
              });
            }}
            className="absolute right-0 inset-y-0 z-20 grid place-items-center w-8 text-muted-foreground hover:text-foreground bg-white dark:bg-zinc-900/85 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

export default SearchBookmarkInput;
