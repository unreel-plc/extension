import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";
import { Navigate, Outlet, NavLink } from "react-router-dom";
import SearchBookmarkInput from "@/pages/search/search-bookmark-input";
import { Home, Archive, User, Download, LayoutDashboard } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useGetProssingBookmarks } from "@/hooks/use-engine";
import useAuthentication from "@/hooks/use-authentication";
import MobileNav from "@/components/mobile-nav";

const Layout = () => {
  const { authenticated, isLoading } = useAuthStore();
  const { currentUser } = useAuthentication();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);
  const { data: processingBookmarks } = useGetProssingBookmarks({ limit: 200 });
  useEffect(() => {
    const checkCurrentUser = async () => {
      await currentUser();
      setIsAuthChecked(true);
    };
    checkCurrentUser();
  }, []);

  if (!isAuthChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Desktop Sidebar */}
      <aside
        className={`${
          isDesktopSidebarOpen ? "md:flex" : "md:hidden"
        } hidden md:fixed md:inset-y-0 md:left-0 md:z-20 md:w-56 md:flex-col border-r border-border bg-white/95 dark:bg-slate-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/70`}
      >
        <div className="px-4 py-3 border-b border-border">
          <div className="text-sm font-semibold">Unreel</div>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Home
                  className="h-4 w-4"
                  fill={isActive ? "currentColor" : "none"}
                  strokeWidth={isActive ? 0 : 2}
                />
                <span>Home</span>
              </>
            )}
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <LayoutDashboard
                  className="h-4 w-4"
                  fill={isActive ? "currentColor" : "none"}
                  strokeWidth={isActive ? 0 : 2}
                />
                <span>Dashboard</span>
              </>
            )}
          </NavLink>
          <NavLink
            to="/archive"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Archive
                  className="h-4 w-4"
                  fill={isActive ? "currentColor" : "none"}
                  strokeWidth={isActive ? 0 : 2}
                />
                <span>Archive</span>
              </>
            )}
          </NavLink>
          <NavLink
            to="/downloads"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Download
                    className="h-4 w-4"
                    fill={isActive ? "currentColor" : "none"}
                    strokeWidth={isActive ? 0 : 2}
                  />
                  {processingBookmarks && processingBookmarks.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {processingBookmarks.length}
                    </span>
                  )}
                </div>
                <span>Downloads</span>
              </>
            )}
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <User
                  className="h-4 w-4"
                  fill={isActive ? "currentColor" : "none"}
                  strokeWidth={isActive ? 0 : 2}
                />
                <span>Profile</span>
              </>
            )}
          </NavLink>
        </nav>
        <div className="px-3 py-3 border-t border-border">
          <ModeToggle />
        </div>
      </aside>

      {/* Main column (with left margin when sidebar visible) */}
      <div className={`${isDesktopSidebarOpen ? "md:ml-56" : "md:ml-0"}`}>
        <div className="sticky top-0 z-10 w-full">
          <div className="px-4 bg-white dark:bg-black py-3">
            <SearchBookmarkInput
              onToggleDesktopSidebar={() =>
                setIsDesktopSidebarOpen((prev) => !prev)
              }
              isDesktopSidebarOpen={isDesktopSidebarOpen}
            />
          </div>
        </div>
        <div className="pb-16 md:pb-0">
          <Outlet />
          {/* {JSON.stringify(user)} */}
        </div>
      </div>
      <MobileNav />
    </div>
  );
};

export default Layout;
