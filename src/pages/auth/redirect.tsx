import { useEffect, useState } from "react";
import useAuthentication from "@/hooks/use-authentication";
import { useAuthStore } from "@/stores/auth-store";

// Type assertion for window.close() method
const closeWindow = () => (window as Window & { close(): void }).close();

const RedirectPage = () => {
  const { currentUser } = useAuthentication();
  const { user, isLoading } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    console.log("Better Auth redirect landed inside extension");

    // When Google auth is done, Better Auth redirected here
    // At this point, cookies are set by your backend

    // Notify background script and check authentication
    const handleRedirect = async () => {
      try {
        // Check if user is authenticated after redirect
        await currentUser();

        // Set redirecting state to false after user is fetched
        setIsRedirecting(false);

        // Small delay before closing to show the success state
        setTimeout(() => {
          // Optionally reload popup or close window
          // Check if we're in a Chrome extension popup
          if (chrome?.windows?.getCurrent) {
            chrome.windows.getCurrent((window) => {
              if (window?.type === "popup") {
                // Close the popup window
                chrome.windows.remove(window.id!);
              } else {
                // If not in popup, close the current window
                closeWindow();
              }
            });
          } else {
            // Fallback for non-extension environments
            closeWindow();
          }
        }, 1500);
      } catch (error) {
        console.error("Error handling redirect:", error);
        setIsRedirecting(false);
        // Still try to close the window after showing error
        setTimeout(() => {
          closeWindow();
        }, 2000);
      }
    };

    // Small delay to ensure authentication state is properly set
    const timeoutId = setTimeout(handleRedirect, 1000);

    return () => clearTimeout(timeoutId);
  }, [currentUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">
          {isLoading
            ? "Authenticating..."
            : isRedirecting
            ? "Redirecting..."
            : user
            ? "Success! Closing window..."
            : "Authentication failed"}
        </p>
        {user && !isRedirecting && (
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
            Welcome back, {user.name || user.email}!
          </p>
        )}
      </div>
    </div>
  );
};

export default RedirectPage;
