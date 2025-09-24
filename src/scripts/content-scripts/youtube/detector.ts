import {
  type YouTubeShortsData,
  type YouTubeShortsDetector,
  type VideoChangeCallback,
} from "./types";

class YouTubeShortsDetectorImpl implements YouTubeShortsDetector {
  private currentVideoId: string | null = null;
  private currentVideoData: YouTubeShortsData | null = null;
  private lastUrl: string = location.href;
  private mutationObserver: MutationObserver | null = null;
  private isActive: boolean = false;
  private videoChangeCallbacks: VideoChangeCallback[] = [];

  public detectYouTubeShorts(): YouTubeShortsData {
    // Check if we're on a YouTube Shorts page
    const isShortsPage: boolean = window.location.pathname.includes("/shorts/");

    if (isShortsPage) {
      // Get the video ID from the URL
      const videoId: string = window.location.pathname.split("/shorts/")[1];

      // Get video title
      const titleElement: Element | null = document.querySelector(
        "h1.ytd-video-primary-info-renderer, h1.title"
      );
      const title: string =
        titleElement?.textContent?.trim() || "Unknown Title";

      // Get video element
      const videoElement: HTMLVideoElement | null =
        document.querySelector("video");
      const videoUrl: string =
        videoElement?.src || videoElement?.currentSrc || "";

      const shortsData: YouTubeShortsData = {
        isShorts: true,
        videoId,
        title,
        videoUrl,
        currentUrl: window.location.href,
        timestamp: new Date().toISOString(),
      };

      // Store current video data
      this.currentVideoData = shortsData;
      this.currentVideoId = videoId;

      // Trigger callbacks
      this.triggerVideoChangeCallbacks(shortsData);

      //   console.log("YouTube Shorts detected:", shortsData);
      return shortsData;
    }

    console.log("Not a YouTube Shorts page");
    const notShortsData: YouTubeShortsData = { isShorts: false };
    this.currentVideoData = notShortsData;
    return notShortsData;
  }

  public checkForVideoChange(): void {
    const isShortsPage: boolean = window.location.pathname.includes("/shorts/");

    if (isShortsPage) {
      const newVideoId: string = window.location.pathname.split("/shorts/")[1];

      // If video ID changed, detect the new shorts
      if (newVideoId && newVideoId !== this.currentVideoId) {
        this.currentVideoId = newVideoId;
        // Longer delay to ensure DOM is fully updated for YouTube Shorts
        setTimeout((): void => {
          this.detectYouTubeShorts();
        }, 1000);
      }
    }
  }

  public startDetection(): void {
    if (this.isActive) {
      console.log("YouTube Shorts detector is already active");
      return;
    }

    this.isActive = true;

    // Run initial detection
    this.detectYouTubeShorts();

    // Set up listeners for URL changes (when scrolling through shorts)
    this.mutationObserver = new MutationObserver((): void => {
      const url: string = location.href;
      if (url !== this.lastUrl) {
        this.lastUrl = url;
        this.checkForVideoChange();
      }
    });

    this.mutationObserver.observe(document, { subtree: true, childList: true });

    // Also listen for popstate events (back/forward navigation)
    window.addEventListener("popstate", (): void => {
      setTimeout(this.checkForVideoChange.bind(this), 100);
    });

    console.log("YouTube Shorts detector started");
  }

  public stopDetection(): void {
    if (!this.isActive) {
      console.log("YouTube Shorts detector is not active");
      return;
    }

    this.isActive = false;

    // Disconnect the mutation observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    // Remove event listeners
    window.removeEventListener("popstate", this.checkForVideoChange.bind(this));

    console.log("YouTube Shorts detector stopped");
  }

  public getCurrentVideo(): YouTubeShortsData | null {
    return this.currentVideoData;
  }

  public onVideoChange(callback: VideoChangeCallback): void {
    this.videoChangeCallbacks.push(callback);
  }

  public offVideoChange(callback: VideoChangeCallback): void {
    const index = this.videoChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.videoChangeCallbacks.splice(index, 1);
    }
  }

  private triggerVideoChangeCallbacks(videoData: YouTubeShortsData): void {
    this.videoChangeCallbacks.forEach((callback) => {
      try {
        callback(videoData);
      } catch (error) {
        console.error("Error in video change callback:", error);
      }
    });
  }
}

// Export a singleton instance
export const youtubeShortsDetector = new YouTubeShortsDetectorImpl();
