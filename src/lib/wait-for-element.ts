export async function waitForElement(
  ...selectors: string[]
): Promise<HTMLElement | null> {
  // Try existing DOM first
  for (const selector of selectors) {
    const existing = document.querySelector(selector) as HTMLElement | null;
    if (existing) return existing;
  }

  return new Promise<HTMLElement | null>((resolve) => {
    const observer = new MutationObserver(() => {
      for (const selector of selectors) {
        const el = document.querySelector(selector) as HTMLElement | null;
        if (el) {
          observer.disconnect();
          resolve(el);
          return;
        }
      }
    });

    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
    });

    // Fallback timeout after 8s
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, 8000);
  });
}

export function closestMatch(
  element: HTMLElement | null,
  ...selectors: string[]
): HTMLElement | null {
  if (!element) return null;
  for (const selector of selectors) {
    const found = element.closest(selector) as HTMLElement | null;
    if (found) return found;
  }
  return null;
}
