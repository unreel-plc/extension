/* eslint-disable @typescript-eslint/no-explicit-any */
import APIClient from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

const apiClient = new APIClient("/users");

interface SignInSocialsPayload {
  provider: string;
  callbackURL: string;
}

const useAuthentication = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);
  const setToken = useAuthStore((state) => state.setToken);
  const logoutuser = useAuthStore((state) => state.logout);

  const loginSocials = async (data: SignInSocialsPayload) => {
    setIsLoading(true);
    try {
      const result = await apiClient.post<{
        url: string;
        redirect: true;
      }>("/sign-in/socials", data);

      const popup = window.open(
        result.data.url,
        "unreel_auth",
        "width=500,height=650,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes,noopener,noreferrer"
      );

      if (!popup) {
        window.location.href = result.data.url;
        return;
      }

      popup.focus?.();

      // Listen for popup completion
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          // Check authentication status after popup closes
          setTimeout(() => {
            currentUser();
          }, 1000);
        }
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      setAuthenticated(false);
      setIsLoading(false);
      return false;
    }
  };

  const currentUser = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await apiClient.get<any>("/me");

      if (result && result.user) {
        setUser(result.user);

        // Store token if available
        if (result.session?.token) {
          setToken(result.session.token);
        }

        setAuthenticated(true);
        console.log("User authenticated:", result.user);
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
  };

  const logout = async () => {
    try {
      await apiClient.post("/logout");
      setAuthenticated(false);
      logoutuser();
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API call fails
      setAuthenticated(false);
      logoutuser();
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
