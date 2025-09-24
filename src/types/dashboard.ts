export interface DashboardCounts {
  totalDownloads: number;
  uniqueItems: number;
  transcriptItems: number;
  flashcardItems: number;
}

export interface DashboardWatchTime {
  totalSeconds: number;
  totalHours: number;
  averageSeconds: number;
}

export interface KeyCountPair {
  count: number;
  key: string;
}

export interface PlatformCountPair {
  count: number;
  platform: string;
}

export interface PlatformWatchTimePair {
  seconds: number;
  platform: string;
}

export interface DashboardDistribution {
  byContentPlatform: PlatformCountPair[];
  byUserPlatform: PlatformCountPair[];
  watchTimeByPlatform: PlatformWatchTimePair[];
  categories: KeyCountPair[];
  tags: KeyCountPair[];
  channels: KeyCountPair[];
}

export interface DashboardActivityByDayItem {
  count: number;
  seconds: number;
  date: string; // ISO date string
}

export interface DashboardActivity {
  byDay: DashboardActivityByDayItem[];
  streakDays: number;
}

export interface DashboardRecentItem {
  id: string;
  downloadId: string;
  title: string;
  platform: string;
  thumbnail: string;
  duration: number;
  link: string;
  createdAt: string; // ISO
}

export interface DashboardResponse {
  counts: DashboardCounts;
  watchTime: DashboardWatchTime;
  distribution: DashboardDistribution;
  activity: DashboardActivity;
  recent: DashboardRecentItem[];
  lastUpdated: string; // ISO
}

export interface DashboardQueryParams {
  recentLimit?: number;
  days?: number;
  startDate?: string; // ISO
  endDate?: string; // ISO
}
