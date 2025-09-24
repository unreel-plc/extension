import BookmarkButton from "@/components/bookmark-button";
import { createRoot } from "react-dom/client";
import styles from "@/index.css?inline";
import { isUserAuthenticated } from "@/lib/auth";

declare global {
  interface WindowEventMap {
    "spa-url-change": CustomEvent<{ url: string }>;
  }
}

export class FacebookHandle {
  private currentUrl: string;
  private reelsObserver?: MutationObserver;
  private processingTimeout?: number;
  private authed: boolean = false;

  constructor() {
    this.currentUrl = window.location.href;
    this.handleAuth();
  }

  private async isUserAuthenticated(): Promise<boolean> {
    return isUserAuthenticated();
  }

  private async handleAuth() {
    this.authed = await this.isUserAuthenticated();
    if (!this.authed) return;
    this.detectUrlChange();
    this.bootstrapReelsObserver();
    this.cleanupExistingButtons();
    this.processAllReels(document);
  }

  private isOnReelsUrl(): boolean {
    // Facebook reels surface
    return /\/reel\//.test(this.currentUrl);
  }

  private cleanupExistingButtons(): void {
    const existingHosts = document.querySelectorAll(
      "#unreel-bookmark-button-host"
    );
    existingHosts.forEach((host) => host.remove());
  }

  detectUrlChange = () => {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL(
      "src/scripts/content-scripts/shared/spa-detector.js"
    );
    script.onload = () => script.remove();
    document.documentElement.appendChild(script);

    window.addEventListener(
      "spa-url-change",
      (event: CustomEvent<{ url: string }>) => {
        this.currentUrl = event.detail.url;
        this.cleanupExistingButtons();
        if (this.isOnReelsUrl()) {
          this.processAllReels(document);
        }
      }
    );
  };

  private bootstrapReelsObserver = () => {
    try {
      this.reelsObserver = new MutationObserver((mutations) => {
        if (this.processingTimeout) {
          clearTimeout(this.processingTimeout);
        }
        this.processingTimeout = window.setTimeout(() => {
          if (!this.isOnReelsUrl()) return;
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType !== Node.ELEMENT_NODE) return;
              this.processAllReels(node as Element);
            });
          });
        }, 100);
      });

      const container = document.body;
      this.reelsObserver.observe(container, {
        childList: true,
        subtree: true,
      });
    } catch (error) {
      console.warn("[Unreel][FB] Failed to start reels observer", error);
    }
  };

  private processAllReels = async (root: Document | Element) => {
    try {
      if (!this.isOnReelsUrl()) return;

      if (
        root.querySelector &&
        root.querySelector("#unreel-bookmark-button-host")
      ) {
        return;
      }

      if (!this.authed) {
        this.authed = await this.isUserAuthenticated();
        if (!this.authed) return;
      }

      // Facebook reels Like button: a role=button with aria-label="Like"
      // In many cases the inner icon is an svg, but the role holder is the button div.
      const likeButtons = root.querySelectorAll<HTMLElement>(
        '[role="button"][aria-label="Like"]'
      );
      if (!likeButtons || likeButtons.length === 0) return;

      likeButtons.forEach((likeButton) => {
        const parent = likeButton.parentElement as HTMLElement | null;
        if (!parent) return;

        const existing = parent.querySelector(
          ":scope > #unreel-bookmark-button-host"
        );
        if (existing) return;

        this.renderBookmarkButton(parent, likeButton);
      });
    } catch (error) {
      console.warn("[Unreel][FB] processAllReels failed", error);
    }
  };

  private renderBookmarkButton = (
    parent: HTMLElement,
    likeButton: HTMLElement
  ): void => {
    try {
      const host = document.createElement("div");
      host.id = "unreel-bookmark-button-host";
      parent.insertBefore(host, likeButton);

      const shadow = host.attachShadow({ mode: "open" });
      const styleEl = document.createElement("style");
      styleEl.textContent = styles;
      shadow.appendChild(styleEl);

      const mount = document.createElement("div");
      shadow.appendChild(mount);

      const root = createRoot(mount);
      root.render(<BookmarkButton />);
    } catch (error) {
      console.warn("[Unreel][FB] Failed to render bookmark button", error);
    }
  };
}
