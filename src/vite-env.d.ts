/// <reference types="vite/client" />

// Chrome Extension API types
declare global {
  interface Window {
    chrome?: {
      runtime?: {
        getURL?: (path: string) => string;
        lastError?: chrome.runtime.LastError;
      };
      tabs?: {
        query?: (
          queryInfo: { active: boolean; currentWindow: boolean },
          callback: (tabs: Array<{ id?: number }>) => void
        ) => void;
        update?: (tabId: number, updateProperties: { url: string }) => void;
        create?: (options: { url: string }) => void;
      };
      storage?: {
        local: {
          get: (
            keys: string[],
            callback: (result: Record<string, unknown>) => void
          ) => void;
          set: (items: Record<string, unknown>, callback?: () => void) => void;
          remove: (keys: string[], callback?: () => void) => void;
        };
      };
    };
  }
}

export {};
