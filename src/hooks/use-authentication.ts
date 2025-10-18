/* eslint-disable @typescript-eslint/no-explicit-any */
import APIClient from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";
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
    const manifest = chrome.runtime.getManifest();
    const clientId = encodeURIComponent(manifest?.oauth2?.client_id ?? "");
    const scopes = encodeURIComponent(
      manifest?.oauth2?.scopes?.join(" ") ?? ""
    );
    const redirectUri = chrome.identity.getRedirectURL("google");

    // Generate a cryptographically secure nonce for OpenID Connect
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const url =
      "https://accounts.google.com/o/oauth2/v2/auth" +
      "?client_id=" +
      clientId +
      "&response_type=id_token" +
      "&redirect_uri=" +
      redirectUri +
      "&scope=" +
      scopes +
      "&nonce=" +
      nonce;
    console.log("the redirect uri is", redirectUri);
    console.log("the url is", url);
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
              console.log("Login successful", result);
            } else {
              console.error("Login failed", result);
            }
          }
        );
      } else {
        console.error("Chrome identity not available");
        setAuthenticated(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthenticated(false);
      setIsLoading(false);
      return false;
    }
  };

  const currentUser = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await apiClient.get<any>("/me");

      if (result) {
        setUser(result.user);

        // Store token if available
        if (result.session?.token) {
          setToken(result.session.token);
        }

        setAuthenticated(true);
        setUser(result.user);

        // console.log("User authenticated:", result.user);

        // Close popup if we're in a Chrome extension popup window
        if (chrome?.windows?.getCurrent) {
          chrome.windows.getCurrent((window) => {
            if (window?.type === "popup") {
              chrome.windows.remove(window.id!);
            }
          });
        }
      } else {
        throw new Error("Invalid user data");
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
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
      // Force logout even if API call fails
      setAuthenticated(false);
      logOutUser();
    }
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      await currentUser();
      return useAuthStore.getState().authenticated;
    } catch {
      return false;
    }
  };

  return {
    loginSocials,
    currentUser,
    logout,
    checkAuthStatus,
  };
};

export default useAuthentication;
