import { useGetProssingBookmarks, useDetectLink } from "@/hooks/use-engine";
import { Archive, Download, House, User, Plus, Loader2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const MobileNav = () => {
  const { data: processingBookmarks } = useGetProssingBookmarks({});
  const [manualLinkDialogOpen, setManualLinkDialogOpen] = useState(false);
  const [manualLink, setManualLink] = useState("");
  const detectLinkMutation = useDetectLink();

  const handleManualLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualLink.trim()) {
      toast.error("Please enter a valid link");
      return;
    }

    try {
      const result = await detectLinkMutation.mutateAsync({ link: manualLink });
      toast.success(result.message || "Link added successfully!");
      setManualLink("");
      setManualLinkDialogOpen(false);
    } catch (error) {
      console.error("Failed to detect link:", error);
      toast.error("Failed to process link. Please try again.");
    }
  };

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-20 rounded-full shadow-2xl backdrop-blur-sm bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10">
      <ul className="grid grid-cols-5 px-2 py-3">
        <li className="flex items-center justify-center">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center justify-center text-xs ${
                isActive ? "text-black" : "text-black/60 dark:text-white/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex items-center justify-center ${
                    isActive ? "bg-white rounded-full p-2.5" : ""
                  }`}
                >
                  <House
                    strokeWidth={1.25}
                    className="h-6 w-6"
                    fill={isActive ? "currentColor" : "none"}
                  />
                </div>
              </>
            )}
          </NavLink>
        </li>
        {/* <li className="flex items-center justify-center">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center justify-center text-xs ${
                isActive
                  ? "text-black"
                  : "text-black/60 dark:text-white/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex items-center justify-center ${
                    isActive ? "bg-white rounded-full p-2.5" : ""
                  }`}
                >
                  <LayoutDashboardIcon
                    className="h-6 w-6"
                    fill={isActive ? "currentColor" : "none"}
                    strokeWidth={isActive ? 0 : 2}
                  />
                </div>
              </>
            )}
          </NavLink>
        </li> */}

        <li className="flex items-center justify-center">
          <NavLink
            to="/archive"
            className={({ isActive }) =>
              `flex items-center justify-center text-xs ${
                isActive ? "text-black" : "text-black/60 dark:text-white/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex items-center justify-center ${
                    isActive ? "bg-white rounded-full p-2.5" : ""
                  }`}
                >
                  <Archive
                    className="h-6 w-6"
                    fill={isActive ? "currentColor" : "none"}
                    strokeWidth={isActive ? 0 : 2}
                  />
                </div>
              </>
            )}
          </NavLink>
        </li>

        {/* Central FAB Button */}
        <li className="flex items-center justify-center">
          <button
            onClick={() => setManualLinkDialogOpen(true)}
            className="flex items-center justify-center -mt-6 p-3.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 group"
            title="Add manual link"
          >
            <Plus className="h-7 w-7 transition-transform duration-300 group-hover:rotate-90" />
          </button>
        </li>
        <li className="flex items-center justify-center">
          <NavLink
            to="/downloads"
            className={({ isActive }) =>
              `flex items-center justify-center text-xs ${
                isActive ? "text-black" : "text-black/60 dark:text-white/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`relative flex items-center justify-center ${
                    isActive ? "bg-white rounded-full p-2.5" : ""
                  }`}
                >
                  <Download
                    className="h-6 w-6"
                    fill={isActive ? "currentColor" : "none"}
                    strokeWidth={isActive ? 0 : 2}
                  />
                  {processingBookmarks && processingBookmarks.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {processingBookmarks.length}
                    </span>
                  )}
                </div>
              </>
            )}
          </NavLink>
        </li>
        <li className="flex items-center justify-center">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center justify-center text-xs ${
                isActive ? "text-black" : "text-black/60 dark:text-white/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex items-center justify-center ${
                    isActive ? "bg-white rounded-full p-2.5" : ""
                  }`}
                >
                  <User
                    className="h-6 w-6"
                    fill={isActive ? "currentColor" : "none"}
                    strokeWidth={isActive ? 0 : 2}
                  />
                </div>
              </>
            )}
          </NavLink>
        </li>
      </ul>

      {/* Manual Link Dialog */}
      <Dialog
        open={manualLinkDialogOpen}
        onOpenChange={setManualLinkDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Manual Link</DialogTitle>
            <DialogDescription>
              Enter a link to a video from YouTube, TikTok, Instagram, or
              Facebook to bookmark it.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleManualLinkSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="link">Video Link</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={manualLink}
                  onChange={(e) => setManualLink(e.target.value)}
                  disabled={detectLinkMutation.isPending}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setManualLinkDialogOpen(false);
                  setManualLink("");
                }}
                disabled={detectLinkMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={detectLinkMutation.isPending}>
                {detectLinkMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default MobileNav;
