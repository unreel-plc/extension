export interface YouTubeShortsData {
  isShorts: boolean;
  videoId?: string;
  title?: string;
  videoUrl?: string;
  currentUrl?: string;
  timestamp?: string;
}

export type VideoChangeCallback = (videoData: YouTubeShortsData) => void;

export interface YouTubeShortsDetector {
  detectYouTubeShorts(): YouTubeShortsData;
  checkForVideoChange(): void;
  startDetection(): void;
  stopDetection(): void;
  getCurrentVideo(): YouTubeShortsData | null;
  onVideoChange(callback: VideoChangeCallback): void;
  offVideoChange(callback: VideoChangeCallback): void;
}
