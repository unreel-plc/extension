import { youtubeShortsDetector } from "./detector";
import { type YouTubeShortsData } from "./types";
import BookmarkButton from "@/components/bookmark-button";
import { createRoot } from "react-dom/client";
import { isUserAuthenticated } from "@/lib/auth";

export class YouTubeHandle {
  constructor() {
    // Set up video change callback
    youtubeShortsDetector.onVideoChange(this.handleVideoChange);

    // Start the YouTube Shorts detection
    youtubeShortsDetector.startDetection();
  }

  private async waitForElement(
    selectors: string[],
    timeoutMs: number = 5000
  ): Promise<Element | null> {
    const start = Date.now();
    return new Promise((resolve) => {
      const check = (): void => {
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el) {
            resolve(el);
            return;
          }
        }
        if (Date.now() - start > timeoutMs) {
          resolve(null);
          return;
        }
        requestAnimationFrame(check);
      };
      check();
    });
  }

  private cleanupExistingButton(): void {
    // Remove any existing bookmark buttons
    const existingButtons = document.querySelectorAll(
      "#unreel-bookmark-button-host"
    );
    existingButtons.forEach((button) => {
      button.remove();
    });
  }

  private async isUserAuthenticated(): Promise<boolean> {
    return isUserAuthenticated();
  }

  handleVideoChange = async (videoData: YouTubeShortsData): Promise<void> => {
    if (videoData.isShorts) {
      // console.log("Video changed to:", videoData);

      // Clean up any existing bookmark buttons first
      this.cleanupExistingButton();

      // Only render the bookmark button if the user is authenticated
      const isAuthed = await this.isUserAuthenticated();
      if (!isAuthed) {
        // console.log("User not authenticated — skipping bookmark button render");
        return;
      }

      // Find a reliable insertion point in Shorts UI and add the bookmark button above it
      const insertionTarget = (await this.waitForElement(
        [
          // Shorts overlay like button (most reliable)
          "ytd-reel-player-overlay-renderer #like-button",
          // Generic like button id (fallback)
          "#like-button",
          // Actions container in Shorts overlay (fallback)
          "ytd-reel-player-overlay-renderer #actions",
          // Shorts renderer action buttons container (broad fallback)
          "ytd-reel-video-renderer #actions",
        ],
        7000
      )) as HTMLElement | null;

      // console.log("Shorts insertion target", insertionTarget);
      if (insertionTarget) {
        // Check if button already exists to prevent recreation
        const existingButton = document.querySelector(
          "#unreel-bookmark-button-host"
        );
        if (existingButton) {
          // console.log("Bookmark button already exists, skipping recreation");
          return;
        }

        // Create a container div before the like button
        const host = document.createElement("div");
        host.id = "unreel-bookmark-button-host";
        host.style.cssText =
          "display: flex; flex-direction: column; align-items: center; margin-bottom: 16px;";
        insertionTarget.parentNode?.insertBefore(host, insertionTarget);

        // Render the React component directly
        const root = createRoot(host);
        root.render(<BookmarkButton />);
      } else {
        // console.warn(
        //   "Could not find insertion target for Shorts bookmark button"
        // );
      }
    } else {
      // console.log("No YouTube Shorts video detected");
      // Clean up when not on shorts page
      this.cleanupExistingButton();
    }
  };
}
