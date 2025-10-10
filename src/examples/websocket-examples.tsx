/**
 * Example: Using WebSocket Hook in Custom Components
 * 
 * This file demonstrates various ways to integrate the WebSocket hook
 * into your own components throughout the extension.
 */

import { useEffect, useState } from "react";
import { useWebSocket, type DownloadProgressData } from "@/hooks/use-websocket";
import { useAuthStore } from "@/stores/auth-store";

// ============================================================================
// Example 1: Simple Download Counter in Header
// ============================================================================

export function DownloadCounter() {
  const user = useAuthStore((state) => state.user);
  const [activeDownloads, setActiveDownloads] = useState(0);
  const backendUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

  const { onDownloadProgress } = useWebSocket({
    url: backendUrl,
    userId: user?.id || null,
    autoConnect: true,
  });

  useEffect(() => {
    const downloads = new Set<string>();

    const unsubscribe = onDownloadProgress((data) => {
      if (data.status === "queued" || data.status === "processing") {
        downloads.add(data.downloadId);
      } else {
        downloads.delete(data.downloadId);
      }
      setActiveDownloads(downloads.size);
    });

    return () => unsubscribe?.();
  }, [onDownloadProgress]);

  if (activeDownloads === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
      </span>
      <span>{activeDownloads} downloading</span>
    </div>
  );
}

// ============================================================================
// Example 2: Download Status Badge
// ============================================================================

interface DownloadStatusBadgeProps {
  downloadId: string;
}

export function DownloadStatusBadge({ downloadId }: DownloadStatusBadgeProps) {
  const user = useAuthStore((state) => state.user);
  const [download, setDownload] = useState<DownloadProgressData | null>(null);
  const backendUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

  const { onDownloadProgress } = useWebSocket({
    url: backendUrl,
    userId: user?.id || null,
    autoConnect: true,
  });

  useEffect(() => {
    const unsubscribe = onDownloadProgress((data) => {
      if (data.downloadId === downloadId) {
        setDownload(data);
      }
    });

    return () => unsubscribe?.();
  }, [downloadId, onDownloadProgress]);

  if (!download) return null;

  return (
    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">
      <div className="w-12 h-1 bg-blue-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${download.progressPercent}%` }}
        />
      </div>
      <span>{download.progressPercent}%</span>
    </div>
  );
}

// ============================================================================
// Example 3: Toast Notification on Download Complete
// ============================================================================

import { toast } from "sonner";

export function DownloadToastNotifier() {
  const user = useAuthStore((state) => state.user);
  const backendUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

  const { onDownloadProgress } = useWebSocket({
    url: backendUrl,
    userId: user?.id || null,
    autoConnect: true,
  });

  useEffect(() => {
    const unsubscribe = onDownloadProgress((data) => {
      if (data.status === "completed") {
        toast.success("Download Complete!", {
          description: data.metadata?.title || "Your download is ready",
        });
      }

      if (data.status === "failed") {
        toast.error("Download Failed", {
          description: data.message || "Something went wrong",
        });
      }
    });

    return () => unsubscribe?.();
  }, [onDownloadProgress]);

  return null; // This component doesn't render anything
}

// ============================================================================
// Example 4: Connection Status Indicator
// ============================================================================

export function ConnectionStatus() {
  const user = useAuthStore((state) => state.user);
  const backendUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

  const { isConnected, isAuthenticated } = useWebSocket({
    url: backendUrl,
    userId: user?.id || null,
    autoConnect: true,
  });

  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className="text-muted-foreground">
        {isConnected ? "Connected" : "Disconnected"}
        {isAuthenticated && " • Authenticated"}
      </span>
    </div>
  );
}

// ============================================================================
// Example 5: Download Progress in Bookmark Card
// ============================================================================

interface BookmarkCardWithProgressProps {
  bookmarkId: string;
  title: string;
  thumbnail: string;
}

export function BookmarkCardWithProgress({
  bookmarkId,
  title,
  thumbnail,
}: BookmarkCardWithProgressProps) {
  const user = useAuthStore((state) => state.user);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const backendUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

  const { onDownloadProgress } = useWebSocket({
    url: backendUrl,
    userId: user?.id || null,
    autoConnect: true,
  });

  useEffect(() => {
    const unsubscribe = onDownloadProgress((data) => {
      // Assuming bookmark has downloadId metadata
      if (data.downloadId === bookmarkId) {
        setIsProcessing(data.status === "processing");
        setProgress(data.progressPercent);
      }
    });

    return () => unsubscribe?.();
  }, [bookmarkId, onDownloadProgress]);

  return (
    <div className="relative rounded-lg overflow-hidden">
      <img src={thumbnail} alt={title} className="w-full aspect-video object-cover" />
      
      {isProcessing && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
          <div className="text-white text-sm mb-2">Processing...</div>
          <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-white text-xs mt-1">{progress}%</div>
        </div>
      )}
      
      <div className="p-2">
        <h3 className="text-sm font-medium truncate">{title}</h3>
      </div>
    </div>
  );
}

// ============================================================================
// Example 6: Download Statistics
// ============================================================================

export function DownloadStatistics() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    processing: 0,
  });
  const backendUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

  const { onDownloadProgress } = useWebSocket({
    url: backendUrl,
    userId: user?.id || null,
    autoConnect: true,
  });

  useEffect(() => {
    const unsubscribe = onDownloadProgress((data) => {
      setStats((prev) => ({
        ...prev,
        total: prev.total + 1,
        completed: data.status === "completed" ? prev.completed + 1 : prev.completed,
        failed: data.status === "failed" ? prev.failed + 1 : prev.failed,
        processing: data.status === "processing" ? prev.processing + 1 : prev.processing,
      }));
    });

    return () => unsubscribe?.();
  }, [onDownloadProgress]);

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold">{stats.total}</div>
        <div className="text-xs text-muted-foreground">Total</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
        <div className="text-xs text-muted-foreground">Processing</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
        <div className="text-xs text-muted-foreground">Completed</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
        <div className="text-xs text-muted-foreground">Failed</div>
      </div>
    </div>
  );
}

// ============================================================================
// Example 7: Manual Connection Control
// ============================================================================

export function ManualConnectionControl() {
  const user = useAuthStore((state) => state.user);
  const backendUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

  const { isConnected, connect, disconnect } = useWebSocket({
    url: backendUrl,
    userId: user?.id || null,
    autoConnect: false, // Manual control
  });

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={connect}
        disabled={isConnected}
        className="px-3 py-1 rounded bg-green-500 text-white disabled:opacity-50"
      >
        Connect
      </button>
      <button
        onClick={disconnect}
        disabled={!isConnected}
        className="px-3 py-1 rounded bg-red-500 text-white disabled:opacity-50"
      >
        Disconnect
      </button>
      <span className="text-sm text-muted-foreground">
        {isConnected ? "Connected" : "Disconnected"}
      </span>
    </div>
  );
}

// ============================================================================
// Example 8: Download Event Logger (for debugging)
// ============================================================================

export function DownloadEventLogger() {
  const user = useAuthStore((state) => state.user);
  const [events, setEvents] = useState<DownloadProgressData[]>([]);
  const backendUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

  const { onDownloadProgress } = useWebSocket({
    url: backendUrl,
    userId: user?.id || null,
    autoConnect: true,
  });

  useEffect(() => {
    const unsubscribe = onDownloadProgress((data) => {
      setEvents((prev) => [data, ...prev].slice(0, 50)); // Keep last 50 events
      console.log("[Download Event]", data);
    });

    return () => unsubscribe?.();
  }, [onDownloadProgress]);

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Recent Download Events</h3>
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {events.map((event, idx) => (
          <div key={idx} className="text-xs bg-muted p-2 rounded font-mono">
            {event.downloadId.slice(-6)} • {event.status} • {event.progressPercent}%
            {event.message && ` • ${event.message}`}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Usage in App
// ============================================================================

/**
 * Add these components to your app layout:
 * 
 * ```tsx
 * import { DownloadToastNotifier, ConnectionStatus } from './examples/websocket-examples';
 * 
 * function App() {
 *   return (
 *     <div>
 *       <Header>
 *         <ConnectionStatus />
 *       </Header>
 *       
 *       <DownloadToastNotifier />
 *       
 *       <Routes>
 *         // ... your routes
 *       </Routes>
 *     </div>
 *   );
 * }
 * ```
 */
