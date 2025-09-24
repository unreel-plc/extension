// Listen for any tab updates to capture tokens from localhost:5173 redirects
chrome.tabs.onUpdated.addListener(
  (_tabId: number, changeInfo: { status?: string }, tab: chrome.tabs.Tab) => {
    try {
      if (changeInfo.status !== "complete" || !tab.url) return;

      const url = new URL(tab.url);
      const isLocal5173 =
        url.origin === "http://localhost:5173" ||
        url.origin === "https://localhost:5173";
      if (!isLocal5173) return;

      const token = url.searchParams.get("token");
      if (!token) return;

      console.log(
        "Background: Token intercepted, storing in Chrome storage as 'auth-storage'"
      );

      // Store token in chrome storage with key "auth-storage" for the extension UI to consume
      chrome.storage.local.set({ "auth-storage": token }, () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Background: Error storing token:",
            chrome.runtime.lastError
          );
          return;
        }

        console.log("Background: Token successfully stored in Chrome storage");

        // Optionally, clean the URL query to remove the token
        // const cleanedUrl = `${url.origin}${url.pathname}`;
        // try {
        //   chrome.tabs.update(tabId, { url: cleanedUrl });
        //   console.log("Background: URL cleaned, token removed from address bar");
        // } catch (e) {
        //   console.error("Background: Error cleaning URL:", e);
        // }
      });
    } catch (e) {
      console.error("Background: Error processing tab update:", e);
    }
  }
);

// Robust URL change detection for Instagram via background APIs
try {
  chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    try {
      if (!details.tabId || !details.url) return;
      if (!/https:\/\/www\.instagram\.com\//.test(details.url)) return;
      console.log(
        "Background: Instagram URL changed (history state):",
        details.url
      );
    } catch (e) {
      console.error("Background: webNavigation onHistoryStateUpdated error", e);
    }
  });

  chrome.webNavigation.onCommitted.addListener((details) => {
    try {
      if (!details.tabId || !details.url) return;
      if (!/https:\/\/www\.instagram\.com\//.test(details.url)) return;
      console.log("Background: Instagram URL committed:", details.url);
    } catch (e) {
      console.error("Background: webNavigation onCommitted error", e);
    }
  });

  chrome.tabs.onUpdated.addListener((_, changeInfo, tab) => {
    try {
      if (!tab.url || !/https:\/\/www\.instagram\.com\//.test(tab.url)) return;
      if (changeInfo.url) {
        console.log("Background: Instagram tab URL updated:", changeInfo.url);
      }
    } catch (e) {
      console.error("Background: tabs.onUpdated error", e);
    }
  });
} catch (e) {
  console.error("Background: error setting up Instagram URL listeners", e);
}

// Define message types
interface BookmarkMessage {
  type: "BOOKMARK_VIDEO";
  data: {
    url: string;
    title: string;
    platform: string;
    type: string;
    timestamp: number;
    author?: string;
  };
}

interface BookmarkResponse {
  success: boolean;
  bookmarkId?: string;
  error?: chrome.runtime.LastError;
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(
  (
    message: BookmarkMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: BookmarkResponse) => void
  ) => {
    if (message.type === "BOOKMARK_VIDEO") {
      console.log("Background: Received bookmark request:", message.data);

      // Store the bookmark data
      const bookmarkKey = `bookmark-${Date.now()}`;
      chrome.storage.local.set({ [bookmarkKey]: message.data }, () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Background: Error storing bookmark:",
            chrome.runtime.lastError
          );
          sendResponse({ success: false, error: chrome.runtime.lastError });
          return;
        }

        console.log("Background: Bookmark stored successfully");
        sendResponse({ success: true, bookmarkId: bookmarkKey });
      });

      return true; // Keep the message channel open for async response
    }
  }
);

// Listen for storage changes to notify the extension popup
chrome.storage.onChanged.addListener(
  (
    changes: { [key: string]: chrome.storage.StorageChange },
    namespace: string
  ) => {
    if (namespace === "local" && changes["auth-storage"]) {
      console.log(
        "Background: auth-storage changed, notifying extension popup"
      );

      // Try to notify the extension popup about the token change
      try {
        chrome.runtime
          .sendMessage({
            type: "TOKEN_UPDATED",
            token: changes["auth-storage"].newValue,
          })
          .catch(() => {
            // Extension popup might not be open, which is fine
          });
      } catch {
        // Ignore errors when popup is not open
      }
    }
  }
);

// Configure side panel to open when the extension icon is clicked
chrome.runtime.onInstalled.addListener(() => {
  try {
    // Prefer built-in behavior if available
    // This will open the side panel (with manifest's default_path) on action click
    // Requires "sidePanel" permission and Chrome 116+
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } catch {
    // Older Chrome versions may not support setPanelBehavior; ignore
  }
});

// Also handle explicit clicks as a fallback
chrome.action.onClicked.addListener(async (tab) => {
  try {
    if (!tab.id) return;
    // With manifest side_panel.default_path set, this opens the panel for the current tab
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch {
    // No-op if unsupported
  }
});
