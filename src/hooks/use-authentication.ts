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
  const logOutUser = useAuthStore((state) => state.logout);
  const setToken = useAuthStore((state) => state.setToken);

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
    } catch {
      setAuthenticated(false);
      setIsLoading(false);
      return false;
    }
  };

  const currentUser = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await apiClient.get<any>("/me");
      setUser(result);
      setToken(result.session.token);
      console.log("result", result);
      setAuthenticated(true);
      setIsLoading(false);
    } catch {
      setAuthenticated(false);
      setIsLoading(false);
    }
  };

  const logout = () => {
    logOutUser();
  };

  return {
    loginSocials,
    currentUser,
    logout,
  };
};

export default useAuthentication;
