import APIClient from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { useCallback } from "react";
import { hydrateAuthStore, isUserAuthenticated } from "@/lib/auth";

const apiClient = new APIClient("/auth");
interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  tier: string;
  karma_points: number;
}

export interface LoggedInUser {
  id: string;
}
const useAuth = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);
  const token = useAuthStore((state) => state.token);
  const logOutUser = useAuthStore((state) => state.logout);
  const googleLogin = () => {
    const loginWithGoogle = () => {
      setIsLoading(true);
      // Build redirect back to the extension after auth
      const w = window as unknown as {
        chrome?: {
          runtime?: { getURL?: (path: string) => string };
          tabs?: {
            query?: (
              queryInfo: { active: boolean; currentWindow: boolean },
              callback: (tabs: Array<{ id?: number }>) => void
            ) => void;
            update?: (tabId: number, updateProperties: { url: string }) => void;
            create?: (options: { url: string }) => void;
          };
          windows?: {
            create?: (
              options: {
                url?: string | string[];
                type?: "normal" | "popup" | "panel" | "detached_panel";
                width?: number;
                height?: number;
                top?: number;
                left?: number;
                focused?: boolean;
              },
              callback?: (win?: unknown) => void
            ) => void;
          };
        };
        location: Location & { href: string };
        open?: (url: string, target?: string) => Window | null;
      };

      const extensionIndexUrl =
        w.chrome?.runtime?.getURL?.("index.html") ||
        w.location.origin + "/index.html";

      // Your backend should redirect to `${redirect_uri}?token=...`
      const redirectParam = encodeURIComponent(extensionIndexUrl);
      const oauthUrl = `http://localhost:3000/auth/google?redirect_uri=${redirectParam}`;
      const chromeApi = w.chrome;

      // Try to open a dedicated popup window first
      if (chromeApi?.windows?.create) {
        try {
          chromeApi.windows.create({
            url: oauthUrl,
            type: "popup",
            width: 480,
            height: 640,
            focused: true,
          });
          return;
        } catch {
          // fall through
        }
      }

      // Fallback to opening a new tab
      if (chromeApi?.tabs?.create) {
        try {
          chromeApi.tabs.create({ url: oauthUrl });
          return;
        } catch {
          // fall through
        }
      }

      // Fallbacks
      if (typeof w.open === "function") {
        w.open(oauthUrl, "_blank");
        return;
      }
      w.location.href = oauthUrl;
    };

    return {
      loginWithGoogle,
    };
  };

  const currentUser = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    await hydrateAuthStore();
    try {
      const result = await apiClient.post<{ valid: boolean; user: User }>(
        "/check-token",
        {
          token: token,
        }
      );
      console.log("result", result);
      setUser(result.data.user);
      setAuthenticated(result.data.valid);
      setIsLoading(false);
    } catch {
      setAuthenticated(false);
      setIsLoading(false);
    }
  }, [setIsLoading, setAuthenticated, setUser, token]);

  const logout = () => {
    logOutUser();
  };

  return {
    currentUser,
    logout,
    googleLogin,
    isUserAuthenticated,
  };
};

export default useAuth;
