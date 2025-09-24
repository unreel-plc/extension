import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { useDashboard } from "@/hooks/use-dashboard";
import type { DashboardResponse } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  TrendingUp,
  Clock3,
  Download,
  ListChecks,
  BarChart3,
  Heart,
  Copy,
  Check,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

const toISODate = (d?: Date) => (d ? d.toISOString() : undefined);

const formatWatchTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
};

const StatCard = ({
  title,
  value,
  icon,
  trend,
  color = "primary",
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color?: string;
}) => (
  <div className="rounded-2xl bg-white/70 dark:bg-black/70 backdrop-blur-sm border border-border/50 shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className={`rounded-xl p-2 bg-${color}-100 dark:bg-${color}-950/30`}>
        {icon}
      </div>
    </div>
    <div className="text-3xl font-bold text-foreground mb-2">{value}</div>
    {trend !== undefined && (
      <div className="flex items-center gap-1 text-xs">
        <TrendingUp className="h-3 w-3 text-green-500" />
        <span className="text-green-500 font-medium">+{trend}%</span>
        <span className="text-muted-foreground">vs last period</span>
      </div>
    )}
  </div>
);

const MiniBarChart = ({
  data,
}: {
  data: { label: string; value: number; color?: string }[];
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground capitalize">
              {item.label}
            </span>
            <span className="text-muted-foreground">{item.value}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${
                item.color || "from-primary/70 to-primary"
              } transition-all duration-500`}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const CircularProgress = ({
  percentage,
  size = 60,
  strokeWidth = 6,
  color = "primary",
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${
    (percentage / 100) * circumference
  } ${circumference}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className={`text-${color}-500 transition-all duration-500`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-foreground">{percentage}%</span>
      </div>
    </div>
  );
};

const SectionCard = ({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <div className="rounded-2xl bg-white/70 dark:bg-black/70 backdrop-blur-sm border border-border/50 shadow-lg overflow-hidden">
    <div className="px-6 py-4 bg-gradient-to-r from-muted/30 to-transparent border-b border-border/30">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Dashboard = () => {
  const [start, setStart] = useState<Date | undefined>();
  const [end, setEnd] = useState<Date | undefined>();
  const [recentLimit, setRecentLimit] = useState<number>(6);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  const { data, isLoading, isFetching, isError } = useDashboard({
    recentLimit: Number(recentLimit),
    startDate: toISODate(start) ?? "",
    endDate: toISODate(end) ?? "",
  });

  const copyToClipboard = async (link: string, id: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy link");
    }
  };

  const d: DashboardResponse | undefined = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      {/* Header */}
      <div className="px-6 py-6 border-b border-border/30 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Your social video insights at a glance
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Collapsible Date Filter */}
        <div className="mb-8">
          <div className="rounded-xl bg-white/70 dark:bg-black/70 backdrop-blur-sm border border-border/50 shadow-lg overflow-hidden">
            {/* Filter Header */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/80 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">
                  Filters & Settings
                </span>
                {(start || end || recentLimit !== 6) && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    Active
                  </span>
                )}
              </div>
              {isFilterOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {/* Filter Content */}
            {isFilterOpen && (
              <div className="border-t border-border/30 p-4 bg-muted/20">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="grid w-full gap-2 grid-cols-1 md:grid-cols-3 items-center">
                    <DatePicker
                      value={start}
                      onChange={setStart}
                      placeholder="Start date"
                    />
                    <span className="text-muted-foreground hidden md:flex items-center justify-center text-sm">
                      to
                    </span>
                    <DatePicker
                      value={end}
                      onChange={setEnd}
                      placeholder="End date"
                    />
                  </div>
                  <div className="flex items-center gap-2 md:ml-4">
                    <label className="text-sm text-muted-foreground whitespace-nowrap">
                      Recent items
                    </label>
                    <select
                      className="h-9 rounded-md border bg-background px-3 text-sm min-w-[80px]"
                      value={recentLimit}
                      onChange={(e) => setRecentLimit(Number(e.target.value))}
                    >
                      <option value={6}>6</option>
                      <option value={12}>12</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                {(start || end || recentLimit !== 6) && (
                  <div className="mt-3 pt-3 border-t border-border/20">
                    <button
                      onClick={() => {
                        setStart(undefined);
                        setEnd(undefined);
                        setRecentLimit(6);
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {isLoading || isFetching ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">
                Loading dashboard insights...
              </p>
            </div>
          </div>
        ) : isError || !d ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-3">
              <div className="text-4xl">📊</div>
              <p className="text-destructive font-medium">
                Failed to load dashboard data
              </p>
              <p className="text-muted-foreground text-sm">
                Please try refreshing the page
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-6 grid-cols-2">
              <StatCard
                title="Total Downloads"
                value={d.counts.totalDownloads.toLocaleString()}
                icon={<Download className="h-5 w-5 text-blue-600" />}
                trend={12}
                color="blue"
              />
              <StatCard
                title="Unique Items"
                value={d.counts.uniqueItems.toLocaleString()}
                icon={<TrendingUp className="h-5 w-5 text-green-600" />}
                trend={8}
                color="green"
              />
              <StatCard
                title="With Transcripts"
                value={d.counts.transcriptItems.toLocaleString()}
                icon={<ListChecks className="h-5 w-5 text-purple-600" />}
                trend={15}
                color="purple"
              />
              <StatCard
                title="With Flashcards"
                value={d.counts.flashcardItems.toLocaleString()}
                icon={<BarChart3 className="h-5 w-5 text-orange-600" />}
                trend={22}
                color="orange"
              />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Watch Time Distribution */}
              <SectionCard
                title="Watch Time by Platform"
                icon={<Clock3 className="h-5 w-5 text-primary" />}
              >
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {formatWatchTime(Math.round(d.watchTime.totalSeconds))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Watch Time
                    </div>
                  </div>
                  <MiniBarChart
                    data={d.distribution.watchTimeByPlatform.map((w, i) => ({
                      label: w.platform,
                      value: Math.round(w.seconds / 60), // Convert to minutes for better display
                      color: [
                        "from-blue-500 to-blue-600",
                        "from-red-500 to-red-600",
                        "from-green-500 to-green-600",
                        "from-purple-500 to-purple-600",
                      ][i % 4],
                    }))}
                  />
                </div>
              </SectionCard>

              {/* Platform Distribution */}
              <SectionCard
                title="Platform Distribution"
                icon={<BarChart3 className="h-5 w-5 text-primary" />}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {d.distribution.byContentPlatform
                      .slice(0, 4)
                      .map((p, index) => {
                        const percentage = Math.round(
                          (p.count / d.counts.totalDownloads) * 100
                        );
                        return (
                          <div
                            key={p.platform}
                            className="text-center space-y-2"
                          >
                            <CircularProgress
                              percentage={percentage}
                              size={50}
                              color={
                                ["blue", "red", "green", "purple"][index % 4]
                              }
                            />
                            <div>
                              <div className="text-xs font-medium capitalize">
                                {p.platform}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {p.count} items
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </SectionCard>

              {/* Categories & Tags */}
              <SectionCard
                title="Top Categories & Tags"
                icon={<ListChecks className="h-5 w-5 text-primary" />}
              >
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-foreground">
                      Categories
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {d.distribution.categories.slice(0, 6).map((c) => (
                        <Badge
                          key={c.key}
                          variant="secondary"
                          className="text-xs"
                        >
                          {c.key} ({c.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-foreground">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {d.distribution.tags.slice(0, 6).map((t) => (
                        <Badge
                          key={t.key}
                          variant="outline"
                          className="text-xs"
                        >
                          #{t.key} ({t.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Recent Items */}
            <SectionCard
              title="Recent Downloads"
              icon={<Download className="h-5 w-5 text-primary" />}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {(recentLimit ? d.recent.slice(0, recentLimit) : d.recent).map(
                  (item) => (
                    <div
                      key={item.id}
                      className="mb-4 break-inside-avoid rounded-3xl p-2 bg-white dark:bg-black shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:ring-black/10 dark:hover:ring-white/20"
                    >
                      <a
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/detail/${item.downloadId}`, {
                            state: item,
                          });
                        }}
                        href={item.link}
                        className="group cursor-pointer block rounded-2xl overflow-hidden bg-white/70 dark:bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 dark:hover:bg-white/10"
                      >
                        <div className="relative">
                          <img
                            src={
                              import.meta.env.VITE_BASE_URL +
                              "/" +
                              item.thumbnail
                            }
                            alt={item.title}
                            className="w-full h-auto object-cover aspect-[9/16]"
                            loading="lazy"
                          />

                          {/* External Link Button - Top Right */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(
                                item.link,
                                "_blank",
                                "noopener,noreferrer"
                              );
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
                                <span className="truncate">{item.title}</span>
                                {item.platform === "youtube" && (
                                  <img
                                    src="https://www.youtube.com/s/desktop/9b55e232/img/favicon_32x32.png"
                                    alt="YouTube"
                                    className="h-4 w-4 shrink-0 rounded-sm"
                                  />
                                )}
                                {item.platform === "tiktok" && (
                                  <img
                                    src="https://www.tiktok.com/favicon.ico"
                                    alt="TikTok"
                                    className="h-4 w-4 shrink-0 rounded-full"
                                  />
                                )}
                                {item.platform === "instagram" && (
                                  <img
                                    src="https://static.cdninstagram.com/rsrc.php/v4/yR/r/lam-fZmwmvn.png"
                                    alt="Instagram"
                                    className="h-4 w-4 shrink-0 rounded-full"
                                  />
                                )}
                                {item.platform === "facebook" && (
                                  <img
                                    src="https://img.icons8.com/color/48/facebook-new.png"
                                    alt="Facebook"
                                    className="h-4 w-4 shrink-0 rounded-full"
                                  />
                                )}
                              </div>
                              <div className="mt-1 text-[11px] md:text-xs text-white/80 truncate pointer-events-auto">
                                {item.platform.charAt(0).toUpperCase() +
                                  item.platform.slice(1)}
                              </div>
                              <div className="mt-3 flex items-center justify-between pointer-events-auto">
                                <div className="flex items-center gap-3 text-xs">
                                  <span className="inline-flex items-center gap-1">
                                    <Heart className="h-4 w-4" />
                                    {formatWatchTime(item.duration)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {/* Copy Button */}
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      copyToClipboard(item.link, item.id);
                                    }}
                                    className="group/copy p-2 rounded-full transition-all duration-200 hover:bg-white/20 active:scale-95"
                                    title={
                                      copiedId === item.id
                                        ? "Copied!"
                                        : "Copy link"
                                    }
                                  >
                                    {copiedId === item.id ? (
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
                  )
                )}
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
