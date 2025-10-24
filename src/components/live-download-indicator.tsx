import { useEffect, useMemo } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useDownloadProgressStore } from "@/stores/download-progress-store";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2 } from "lucide-react";

interface LiveDownloadIndicatorProps {
  className?: string;
}

/**
 * Live Download Indicator Component
 * Shows real-time download progress with WebSocket updates
 * Displays count of active downloads and a circular progress animation
 */
const LiveDownloadIndicator = ({ className = "" }: LiveDownloadIndicatorProps) => {
  const user = useAuthStore((state) => state.user);
  const downloads = useDownloadProgressStore((state) => state.downloads);
  const addOrUpdateDownload = useDownloadProgressStore(
    (state) => state.addOrUpdateDownload
  );
  const removeDownload = useDownloadProgressStore(
    (state) => state.removeDownload
  );

  const backendUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

  const { isAuthenticated, onDownloadProgress } = useWebSocket({
    url: backendUrl,
    userId: user?._id || null,
    autoConnect: true,
  });

  // Subscribe to download progress updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = onDownloadProgress((data) => {
      addOrUpdateDownload(data);

      // Auto-remove completed/failed downloads after 3 seconds
      if (data.status === "completed" || data.status === "failed") {
        setTimeout(() => {
          removeDownload(data.downloadId);
        }, 3000);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [isAuthenticated, onDownloadProgress, addOrUpdateDownload, removeDownload]);

  // Calculate active downloads (queued or processing)
  const activeDownloads = useMemo(() => {
    return Array.from(downloads.values()).filter(
      (d) => d.status === "queued" || d.status === "processing"
    );
  }, [downloads]);

  const activeCount = activeDownloads.length;

  // Calculate average progress
  const averageProgress = useMemo(() => {
    if (activeCount === 0) return 0;
    const total = activeDownloads.reduce(
      (sum, d) => sum + d.progressPercent,
      0
    );
    return Math.round(total / activeCount);
  }, [activeDownloads, activeCount]);

  if (activeCount === 0) return null;

  return (
    <div className={`absolute -top-1 -right-1 ${className}`}>
      {/* Circular Progress Ring */}
      <div className="relative">
        {/* Animated spinning ring for processing state */}
        <div className="absolute inset-0">
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        </div>

        {/* Progress Circle */}
        <svg className="h-5 w-5 -rotate-90" viewBox="0 0 20 20">
          {/* Background circle */}
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${(averageProgress / 100) * 50.265} 50.265`}
            className="text-primary transition-all duration-300"
            strokeLinecap="round"
          />
        </svg>

        {/* Count Badge */}
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shadow-lg ring-2 ring-background">
          {activeCount}
        </div>
      </div>

      {/* Pulsing Animation */}
      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
    </div>
  );
};

export default LiveDownloadIndicator;
