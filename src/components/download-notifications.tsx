import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAuthStore } from "@/stores/auth-store";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Component that requests notification permission and shows notifications
 * for completed downloads. Can be added to any page.
 */
const DownloadNotifications = () => {
  const user = useAuthStore((state) => state.user);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const backendUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

  const { onDownloadProgress } = useWebSocket({
    url: backendUrl,
    userId: user?._id || null,
    autoConnect: true,
  });

  useEffect(() => {
    // Check if notifications are already granted
    if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!notificationsEnabled) return;

    const unsubscribe = onDownloadProgress((data) => {
      // Show notification on completion
      if (data.status === "completed" && data.progressPercent === 100) {
        new Notification("Download Complete! 🎉", {
          body: data.metadata?.title || "Your download is ready",
          icon: data.metadata?.thumbnail,
          badge: "/extension_icon48.png",
          tag: data.downloadId,
        });
      }

      // Show notification on failure
      if (data.status === "failed") {
        new Notification("Download Failed ❌", {
          body: data.message || "Something went wrong with your download",
          badge: "/extension_icon48.png",
          tag: data.downloadId,
        });
      }
    });

    return () => unsubscribe?.();
  }, [notificationsEnabled, onDownloadProgress]);

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationsEnabled(true);
    }
  };

  if (Notification.permission === "denied") {
    return null; // Don't show if user has denied
  }

  if (notificationsEnabled) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Bell className="size-4 text-green-500" />
        <span>Notifications enabled</span>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={requestNotificationPermission}
      className="gap-2"
    >
      <BellOff className="size-4" />
      Enable Download Notifications
    </Button>
  );
};

export default DownloadNotifications;
