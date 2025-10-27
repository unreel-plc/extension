import { useAuthStore } from "@/stores/auth-store";
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
  const { token } = useAuthStore();

  useEffect(() => {
    if (!autoConnect || !userId || !token) return;

    // Initialize Socket.IO connection with WebSocket only (no polling)
    // Connect to the /engine namespace to match backend EngineGateway
    const socket = io(`${url}/engine`, {
      transports: ["websocket"], // WebSocket only - no HTTP polling fallback
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      // Send token in both extraHeaders (for WebSocket upgrade) and auth object
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      auth: {
        token: `Bearer ${token}`,
      },
      // Ensure proper path if backend uses custom path
      path: "/socket.io/",
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("[WebSocket] ✅ Connected successfully!");
      console.log("[WebSocket] Socket ID:", socket.id);
      console.log("[WebSocket] Transport:", socket.io.engine.transport.name);
      setIsConnected(true);

      // Authenticate immediately after connection
      socket.emit("authenticate", { userId });
    });

    socket.on("authenticated", (data) => {
      console.log("[WebSocket] ✅ Authenticated:", data);
      setIsAuthenticated(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("[WebSocket] ⚠️ Disconnected:", reason);
      setIsConnected(false);
      setIsAuthenticated(false);
    });

    socket.on("connect_error", (error) => {
      console.error("[WebSocket] ❌ Connection error:", error.message);
      console.error("[WebSocket] Error details:", error);
    });

    socket.on("error", (error) => {
      console.error("[WebSocket] ❌ Socket error:", error);
    });

    // Cleanup on unmount
    return () => {
      if (socket.connected) {
        console.log("[WebSocket] Cleaning up connection");
        socket.disconnect();
      }
    };
  }, [url, userId, autoConnect, token]);

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

  // Subscribe to download completed event
  const onDownloadCompleted = (
    callback: (data: DownloadProgressData) => void
  ) => {
    if (!socketRef.current) return;

    socketRef.current.on("download:completed", callback);

    // Return unsubscribe function
    return () => {
      socketRef.current?.off("download:completed", callback);
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
    onDownloadCompleted,
    connect,
    disconnect,
  };
};
