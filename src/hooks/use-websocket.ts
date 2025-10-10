import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UseWebSocketOptions {
  url: string;
  userId: string | null;
  autoConnect?: boolean;
}

export interface DownloadProgressData {
  downloadId: string;
  userId: string;
  status: "queued" | "processing" | "completed" | "failed";
  progressPercent: number;
  message?: string;
  metadata?: {
    title?: string;
    thumbnail?: string;
    platform?: string;
    duration?: number;
  };
}

export const useWebSocket = ({
  url,
  userId,
  autoConnect = true,
}: UseWebSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!autoConnect || !userId) return;

    // Initialize Socket.IO connection
    const socket = io(url, {
      transports: ["websocket", "polling"], // Try websocket first, fallback to polling
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("[WebSocket] Connected:", socket.id);
      setIsConnected(true);

      // Authenticate immediately after connection
      socket.emit("authenticate", { userId });
    });

    socket.on("authenticated", (data) => {
      console.log("[WebSocket] Authenticated:", data);
      setIsAuthenticated(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("[WebSocket] Disconnected:", reason);
      setIsConnected(false);
      setIsAuthenticated(false);
    });

    socket.on("connect_error", (error) => {
      console.error("[WebSocket] Connection error:", error);
    });

    socket.on("error", (error) => {
      console.error("[WebSocket] Error:", error);
    });

    // Cleanup on unmount
    return () => {
      if (socket.connected) {
        console.log("[WebSocket] Cleaning up connection");
        socket.disconnect();
      }
    };
  }, [url, userId, autoConnect]);

  // Subscribe to download progress
  const onDownloadProgress = (
    callback: (data: DownloadProgressData) => void
  ) => {
    if (!socketRef.current) return;

    socketRef.current.on("download:progress", callback);

    // Return unsubscribe function
    return () => {
      socketRef.current?.off("download:progress", callback);
    };
  };

  // Manually connect
  const connect = () => {
    socketRef.current?.connect();
  };

  // Manually disconnect
  const disconnect = () => {
    socketRef.current?.disconnect();
  };

  return {
    socket: socketRef.current,
    isConnected,
    isAuthenticated,
    onDownloadProgress,
    connect,
    disconnect,
  };
};
