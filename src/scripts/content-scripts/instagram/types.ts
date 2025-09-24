export interface InstagramReelsData {
  isReel: boolean;
  reelId?: string;
  title?: string;
  videoUrl?: string;
  currentUrl?: string;
  timestamp?: string;
  author?: string;
  description?: string;
  containerElement?: HTMLElement;
}

export type ReelChangeCallback = (reelData: InstagramReelsData) => void;

export interface InstagramReelsDetector {
  detectInstagramReels(): InstagramReelsData;
  detectAllReelsInFeed(): InstagramReelsData[];
  checkForReelChange(): void;
  startDetection(): void;
  stopDetection(): void;
  getCurrentReel(): InstagramReelsData | null;
  onReelChange(callback: ReelChangeCallback): void;
  offReelChange(callback: ReelChangeCallback): void;
}
