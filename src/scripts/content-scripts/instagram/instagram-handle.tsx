import BookmarkButton from "@/components/bookmark-button";
import { createRoot } from "react-dom/client";
import styles from "@/index.css?inline";
import { isUserAuthenticated } from "@/lib/auth";

declare global {
  interface WindowEventMap {
    "spa-url-change": CustomEvent<{ url: string }>;
  }
}

export class InstagramHandle {
  private currentUrl: string;
  private reelsObserver?: MutationObserver;
  private processingTimeout?: number;
  private authed: boolean = false;

  constructor() {
    this.currentUrl = window.location.href;
    // console.log("hello", this.currentUrl);

    this.handleAuth();
  }

  async handleAuth() {
    this.authed = await isUserAuthenticated();
    if (this.authed) {
      // console.log("User is authenticated");
      this.detectUrlChange();
      this.bootstrapReelsObserver();
      // Clean up any existing buttons first
      this.cleanupExistingButtons();
      // Initial pass for already-rendered reels/buttons
      this.processAllReels(document);
    }
  }

  private async isUserAuthenticated(): Promise<boolean> {
    return isUserAuthenticated();
  }

  private cleanupExistingButtons(): void {
    // Remove any existing bookmark button hosts
    const existingHosts = document.querySelectorAll(
      "#unreel-bookmark-button-host"
    );
    existingHosts.forEach((host) => {
      host.remove();
    });
  }

  /**
   * Detects URL changes in the Instagram handle
   *
   * @returns void
   */
  detectUrlChange = () => {
    // Inject the script into the page
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL(
      "src/scripts/content-scripts/shared/spa-detector.js"
    );
    script.onload = () => script.remove(); // Clean up after execution
    document.documentElement.appendChild(script);

    // Listen for SPA URL changes in your content script
    window.addEventListener(
      "spa-url-change",
      (event: CustomEvent<{ url: string }>) => {
        this.currentUrl = event.detail.url;
        // console.log("Detected:", this.currentUrl);
        // Clean up existing buttons on navigation
        this.cleanupExistingButtons();
        // Re-scan on navigation since DOM can be rebuilt
        this.processAllReels(document);
      }
    );
  };

  /**
   * Creates (or recreates) a lightweight MutationObserver targeting newly-added
   * reel action areas. We watch the document body and filter by Like buttons
   * to keep observation minimal while still robust to bulk inserts.
   */
  private bootstrapReelsObserver = () => {
    try {
      this.reelsObserver = new MutationObserver((mutations) => {
        // Filter out mutations that are likely not relevant to reels
        const relevantMutations = mutations.filter((mutation) => {
          if (!mutation.addedNodes || mutation.addedNodes.length === 0)
            return false;

          // Check if any added node contains like buttons or is a significant structural change
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;

            const element = node as Element;

            // Skip our own button hosts
            if (
              element.hasAttribute &&
              (element.hasAttribute("data-unreel-btn") ||
                element.id === "unreel-bookmark-button-host")
            ) {
              return false;
            }

            // Only process if it contains like buttons or is a major container
            if (
              element.querySelector &&
              (element.querySelector('svg[aria-label="Like"]') ||
                element.querySelector('[role="button"]') ||
                element.classList.contains("x1lliihq") || // Common IG container class
                element.tagName === "MAIN" ||
                element.tagName === "ARTICLE" ||
                element.tagName === "SECTION")
            ) {
              return true;
            }
          }
          return false;
        });

        if (relevantMutations.length === 0) return;

        // console.log(
        //   "[Unreel][IG] relevant mutations:",
        //   relevantMutations.length,
        //   "out of",
        //   mutations.length
        // );

        // Debounce processing to avoid excessive calls
        if (this.processingTimeout) {
          clearTimeout(this.processingTimeout);
        }

        this.processingTimeout = window.setTimeout(() => {
          for (const mutation of relevantMutations) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType !== Node.ELEMENT_NODE) return;
              this.processAllReels(node as Element);
            });
          }
        }, 100); // 100ms debounce
      });

      const container = document.querySelector("main");
      if (!container) {
        // If <main> isn't available yet (SPA timing), retry shortly
        // console.warn(
        //   "[Unreel][IG] <main> not found. Retrying observer attach..."
        // );
        setTimeout(() => this.bootstrapReelsObserver(), 500);
        return;
      }

      this.reelsObserver.observe(container, {
        childList: true,
        subtree: true,
      });
    } catch {
      // console.warn("Failed to start reels observer", error);
    }
  };

  /**
   * Processes any subtree (or the whole document) to find Like buttons and
   * inject our React bookmark button above them.
   */
  private processAllReels = async (root: Document | Element) => {
    try {
      // Skip processing if the root contains our own button hosts to prevent recursion
      if (
        root.querySelector &&
        root.querySelector("#unreel-bookmark-button-host")
      ) {
        return;
      }

      const likeSvgs = root.querySelectorAll('svg[aria-label="Like"]');
      if (!likeSvgs || likeSvgs.length === 0) return;

      // Check authentication once for all buttons
      const isAuthed = await this.isUserAuthenticated();
      if (!isAuthed) {
        // console.log("User not authenticated — skipping bookmark button render");
        return;
      }

      likeSvgs.forEach((svg) => {
        const likeButton = svg.closest('[role="button"]') as HTMLElement | null;
        if (!likeButton) return;

        const parent = likeButton.parentElement;
        if (!parent) return;

        // If our button host already exists just above, skip
        const existing = parent.querySelector(
          ":scope > #unreel-bookmark-button-host"
        );
        if (existing) return;

        this.renderBookmarkButton(parent, likeButton);
      });
    } catch (error) {
      console.warn("processAllReels failed", error);
    }
  };

  /**
   * Renders the React bookmark button using Shadow DOM above the Like button.
   */
  private renderBookmarkButton = (
    parent: HTMLElement,
    likeButton: HTMLElement
  ): void => {
    try {
      // Create a shadow host before the like button
      const host = document.createElement("div");
      host.id = "unreel-bookmark-button-host";
      // Add Instagram-like classes to match the UI styling
      const instagramClasses = [
        "x1i10hfl",
        "x972fbf",
        "x10w94by",
        "x1qhh985",
        "x14e42zd",
        "x9f619",
        "x3ct3a4",
        "xdj266r",
        "x14z9mp",
        "xat24cr",
        "x1lziwak",
        "x16tdsg8",
        "x1hl2dhg",
        "xggy1nq",
        "x1a2a7pz",
        "x6s0dn4",
        "xjbqb8w",
        "x1ejq31n",
        "x18oe1m7",
        "x1sy0etr",
        "xstzfhl",
        "x1ypdohk",
        "x78zum5",
        "xl56j7k",
        "x1y1aw1k",
        "xf159sx",
        "xwib8y2",
        "xmzvs34",
        "xcdnw81",
      ];

      instagramClasses.forEach((className) => {
        if (className.trim()) {
          host.classList.add(className.trim());
        }
      });
      // Instagram action buttons are wrapped in separate <span> siblings.
      // Insert our host inside a new <span> placed right after the Like button's <span>
      // so it aligns horizontally with Comment/Share.
      const likeSpan = likeButton.closest("span");
      const actionsContainer = likeSpan?.parentElement ?? parent;

      host.setAttribute("role", "button");
      host.setAttribute("tabindex", "0");

      const spanWrapper = document.createElement("span");
      spanWrapper.appendChild(host);

      if (likeSpan && actionsContainer) {
        const afterLike = likeSpan.nextSibling;
        if (afterLike) {
          actionsContainer.insertBefore(spanWrapper, afterLike);
        } else {
          actionsContainer.appendChild(spanWrapper);
        }
      } else {
        // Fallback: keep previous behavior within the same parent container
        const referenceNode = likeButton.nextSibling;
        if (referenceNode) {
          parent.insertBefore(host, referenceNode);
        } else {
          parent.appendChild(host);
        }
      }

      // Attach shadow DOM and inject our Tailwind CSS
      const shadow = host.attachShadow({ mode: "open" });
      const styleEl = document.createElement("style");
      styleEl.textContent = styles;
      shadow.appendChild(styleEl);

      // Mount point inside shadow
      const mount = document.createElement("div");
      shadow.appendChild(mount);

      // Render the React component inside the shadow root
      const root = createRoot(mount);
      root.render(<BookmarkButton />);
    } catch (error) {
      console.warn("Failed to render bookmark button", error);
    }
  };
}
