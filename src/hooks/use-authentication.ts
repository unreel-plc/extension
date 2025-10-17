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
    try {
      // Use Chrome extension OAuth flow
      if (chrome?.identity) {
        chrome.identity.getAuthToken(
          { interactive: true },
          async (googleToken) => {
            if (googleToken) {
              try {
                console.log("Google OAuth Token:", googleToken);
                // First, exchange the Google OAuth token with Google's token endpoint to get JWT ID token
                const googleTokenResponse = await fetch(
                  "https://oauth2.googleapis.com/token",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
                      client_secret:
                        import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "",
                      refresh_token: googleToken as string,
                      grant_type: "refresh_token",
                    }),
                  }
                );

                if (!googleTokenResponse.ok) {
                  throw new Error(
                    `Google token exchange failed: ${googleTokenResponse.status}`
                  );
                }

                const googleTokenData = await googleTokenResponse.json();
                console.log("Google JWT ID Token:", googleTokenData.id_token);

                // Now send the JWT ID token to our backend
                const result = await apiClient.post<{
                  token: string;
                  user: any;
                }>("/google-token", {
                  token: googleTokenData.id_token,
                });

                console.log("Backend JWT Token:", result);

                // Set the JWT token in the auth store
                setToken(result.data.token);
                setUser(result.data.user);
                setAuthenticated(true);
                setIsLoading(false);
              } catch (error) {
                console.error("Token exchange error:", error);
                setAuthenticated(false);
                setIsLoading(false);
              }
            } else {
              console.error("No Google token received");
              setAuthenticated(false);
              setIsLoading(false);
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
