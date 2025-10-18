/* eslint-disable @typescript-eslint/no-explicit-any */
import { extractIdToken, getOauthUrl } from "@/lib/oauth-config";
import APIClient from "@/services/api-client";
import { useAuthStore, type User } from "@/stores/auth-store";
import { useCallback } from "react";

const apiClient = new APIClient("/auth");

const useAuthentication = () => {
  const {
    setUser,
    setAuthenticated,
    setIsLoading,
    setToken,
    logout: logOutUser,
  } = useAuthStore();

  const loginSocials = async () => {
    setIsLoading(true);
    const url = getOauthUrl();
    try {
      // Use Chrome extension OAuth flow
      if (chrome?.identity) {
        chrome.identity.launchWebAuthFlow(
          {
            url: url,
            interactive: true,
          },
          (result) => {
            if (result) {
              // Extract ID token from the callback URL
              const idToken = extractIdToken(result);

              if (idToken) {
                exchangeGoogleToken(idToken);
              }
            }
          }
        );
      }
    } catch {
      setIsLoading(false);
    }
  };

  const exchangeGoogleToken = async (idToken: string) => {
    try {
      const result = await apiClient.post<{ token: string }>("/google-token", {
        token: idToken,
      });
      if (result) {
        setToken(result.data.token);
        await currentUser();
      }
    } catch {
      setIsLoading(false);
    }
  };

  const currentUser = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await apiClient.get<User>("/me");
      if (result) {
        setUser(result);
        setAuthenticated(true);
      } else {
        throw new Error("Invalid user data");
      }
    } catch {
      setAuthenticated(false);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setUser, setToken, setAuthenticated]);

  const logout = async () => {
    try {
      await apiClient.post("/logout");
      setAuthenticated(false);
      setUser(null);
      logOutUser();
    } catch (error) {
      console.error("Logout error:", error);
      setAuthenticated(false);
      logOutUser();
    }
  };

  return {
    loginSocials,
    currentUser,
    logout,
  };
};

export default useAuthentication;
