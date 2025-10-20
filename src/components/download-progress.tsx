import { useEffect } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useDownloadProgressStore } from "@/stores/download-progress-store";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2, CheckCircle2, XCircle, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DownloadProgress = () => {
  const user = useAuthStore((state) => state.user);
  const downloads = useDownloadProgressStore((state) => state.downloads);
  const addOrUpdateDownload = useDownloadProgressStore(
    (state) => state.addOrUpdateDownload
  );
  const removeDownload = useDownloadProgressStore(
    (state) => state.removeDownload
  );

  const backendUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

  const { isConnected, isAuthenticated, onDownloadProgress } = useWebSocket({
    url: backendUrl,
    userId: user?._id || null,
    autoConnect: true,
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    // Subscribe to download progress updates
    const unsubscribe = onDownloadProgress((data) => {
      console.log("[Download Progress]", data);

      addOrUpdateDownload(data);

      // Auto-remove completed/failed downloads after 5 seconds
      if (data.status === "completed" || data.status === "failed") {
        setTimeout(() => {
          removeDownload(data.downloadId);
        }, 5000);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [
    isAuthenticated,
    onDownloadProgress,
    addOrUpdateDownload,
    removeDownload,
  ]);

  const activeDownloads = Array.from(downloads.values());

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <>
              <Wifi className="size-3.5 text-green-500" />
              <span className="text-green-600 dark:text-green-400 font-medium">
                Connected
              </span>
            </>
          ) : (
            <>
              <WifiOff className="size-3.5 text-red-500" />
              <span className="text-red-600 dark:text-red-400 font-medium">
                Disconnected
              </span>
            </>
          )}
        </div>
        {isAuthenticated && (
          <Badge variant="secondary" className="text-xs">
            Authenticated
          </Badge>
        )}
      </div>

      {/* Active Downloads */}
      {activeDownloads.length > 0 ? (
        <div className="space-y-3">
          {activeDownloads.map((download) => (
            <div
              key={download.downloadId}
              className="rounded-xl p-3 bg-white dark:bg-black shadow-sm ring-1 ring-black/5 dark:ring-white/10"
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                {download.metadata?.thumbnail ? (
                  <img
                    src={download.metadata.thumbnail}
                    alt={download.metadata.title || "Downloading"}
                    className="w-20 h-20 object-cover rounded-lg shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 bg-muted rounded-lg shrink-0 flex items-center justify-center">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                )}

                {/* Download Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground truncate">
                    {download.metadata?.title || "Processing download..."}
                  </h4>

                  {/* Progress Bar */}
                  <div className="mt-2 w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                      style={{ width: `${download.progressPercent}%` }}
                    />
                  </div>

                  {/* Status Details */}
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {download.progressPercent}%
                    </span>

                    {download.status === "queued" && (
                      <Badge variant="outline" className="text-xs">
                        Queued
                      </Badge>
                    )}
                    {download.status === "processing" && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Loader2 className="size-3 animate-spin" />
                        Processing
                      </Badge>
                    )}
                    {download.status === "completed" && (
                      <Badge
                        variant="outline"
                        className="text-xs gap-1 text-green-600 border-green-600"
                      >
                        <CheckCircle2 className="size-3" />
                        Completed
                      </Badge>
                    )}
                    {download.status === "failed" && (
                      <Badge
                        variant="outline"
                        className="text-xs gap-1 text-red-600 border-red-600"
                      >
                        <XCircle className="size-3" />
                        Failed
                      </Badge>
                    )}

                    {download.message && (
                      <span className="text-muted-foreground italic truncate">
                        {download.message}
                      </span>
                    )}
                  </div>

                  {/* Platform Badge */}
                  {download.metadata?.platform && (
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {download.metadata.platform}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        isAuthenticated && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No active downloads
          </div>
        )
      )}
    </div>
  );
};

export default DownloadProgress;
