import { createRoot } from "react-dom/client";
import styles from "@/index.css?inline";
import { isUserAuthenticated } from "@/lib/auth";
import TiktokBookmark from "./titok-bookmark";

declare global {
  interface WindowEventMap {
    "spa-url-change": CustomEvent<{ url: string }>;
  }
}

export class TikTokHandle {
  private actionsObserver?: MutationObserver;
  private scanTimeout?: number;
  private authed: boolean = false;

  constructor() {
    this.handleAuth();
  }

  private async isUserAuthenticated(): Promise<boolean> {
    return isUserAuthenticated();
  }

  private async handleAuth() {
    // console.log("tiktok handle auth");
    this.authed = await this.isUserAuthenticated();
    if (!this.authed) return;
    this.bootstrapObserver();
    this.cleanupExistingButtons();
    // Initial scan for existing items
    this.processActions(document);
  }

  private cleanupExistingButtons(): void {
    const existingHosts = document.querySelectorAll(
      "#unreel-bookmark-button-host"
    );
    existingHosts.forEach((host) => host.remove());
  }

  private bootstrapObserver() {
    // console.log("tiktok handle bootstrap observer");
    this.actionsObserver = new MutationObserver((mutations) => {
      // Debounce scans while scrolling loads batches
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
      }
      this.scanTimeout = window.setTimeout(() => {
        // Scan newly added nodes first
        mutations.forEach((m) => {
          m.addedNodes.forEach((n) => {
            if (n.nodeType !== Node.ELEMENT_NODE) return;
            this.processActions(n as Element);
          });
        });
        // Safety: scan the container once in case of partial nodes
        this.processActions(document);
      }, 100);
    });
    const container =
      document.getElementById("column-list-container") || document.body;
    this.actionsObserver.observe(container, {
      childList: true,
      subtree: true,
    });
  }

  private async processActions(root: Document | Element) {
    try {
      if (!this.authed) {
        this.authed = await this.isUserAuthenticated();
        if (!this.authed) return;
      }

      // Find all like icons within the TikTok action bar section
      const likeIcons = root.querySelectorAll(
        'section.e12arnib0 [data-e2e="like-icon"], .e12arnib0 [data-e2e="like-icon"], [data-e2e="like-icon"]'
      );
      if (!likeIcons || likeIcons.length === 0) return;

      likeIcons.forEach((icon) => {
        const likeButton = (icon as HTMLElement).closest("button");
        if (!likeButton) return;

        const parent = likeButton.parentElement;
        if (!parent) return;

        // Only inject once per action stack, directly above the like button
        const existingHost = parent.querySelector(
          ":scope > #unreel-bookmark-button-host"
        );
        if (existingHost) return;

        // Extra guard: avoid adding multiple per same like button
        if (
          likeButton.previousElementSibling?.id ===
          "unreel-bookmark-button-host"
        )
          return;

        this.renderBookmark(parent as HTMLElement, likeButton as HTMLElement);
      });
    } catch {
      // ignore
    }
  }

  getVisibleTikTokLink = () => {
    const intersectionArea = (r: DOMRect) => {
      const vw = window.innerWidth,
        vh = window.innerHeight;
      const x = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
      const y = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      return x * y;
    };

    // 1) Pick the most visible <video>
    const videos = Array.from(document.querySelectorAll("video"));
    if (videos.length === 0) return null;
    const visible = videos
      .map((v) => ({ v, area: intersectionArea(v.getBoundingClientRect()) }))
      .sort((a, b) => b.area - a.area)[0];
    if (!visible || visible.area === 0) return null;

    // 2) Find its containing article
    const article =
      visible.v.closest('[data-e2e="recommend-list-item-container"]') ||
      visible.v.closest("article");
    if (!article) return null;

    // 3) Extract username (several fallbacks)
    const authorEl = article.querySelector(
      '[data-e2e="video-author-uniqueid"]'
    );
    let username = authorEl?.textContent?.trim();
    if (!username) {
      const authorHref = article
        .querySelector('[data-e2e="video-author-avatar"]')
        ?.getAttribute("href");
      const m = authorHref?.match(/\/@([^/?#]+)/);
      if (m) username = m[1];
    }
    if (!username) return null;

    // 4) Extract item_id (prefer wrapper id, then source URLs)
    const wrapper = article.querySelector('[id^="xgwrapper-0-"]');
    let itemId = wrapper?.id?.split("xgwrapper-0-")[1];
    if (!itemId) {
      const srcEls = Array.from(
        article.querySelectorAll("video source[src]")
      ) as HTMLSourceElement[];
      const withItem = srcEls
        .map((s): URL | null => {
          try {
            return new URL(s.src);
          } catch {
            return null;
          }
        })
        .filter((u): u is URL => u !== null)
        .map((u) => u.searchParams.get("item_id"))
        .find((v): v is string => !!v);
      if (withItem) itemId = withItem;
    }
    if (!itemId) return null;

    return `https://www.tiktok.com/@${username}/video/${itemId}`;
  };

  private renderBookmark(parent: HTMLElement, likeButton: HTMLElement) {
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
      root.render(<TiktokBookmark link={this.getVisibleTikTokLink() || ""} />);
    } catch {
      // ignore
    }
  }
}
