import ApiClient from "@/services/api-client";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

export const apiClient = new ApiClient("/engine");

export interface Bookmark {
  _id: string;
  link: string;
  platform: string;
  videoId: string;
  title: string;
  thumbnail: string;
  duration: number;
  description: string;
  metadataPath: string;
  uploaderUrl: string;
  channel: string;
  channelFollowerCount: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  uploadDate: string;
  youtubeSubtitleSrtPath: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  categories: string[];
  categorizationNotes: string;
  categoryConfidence: number;
  flashcardSummary: string;
  tags: string[];
  taxonomyVersion: string;
  transcriptText: string;
}

export interface BookmarkResponse {
  results: Bookmark[];
  total: number;
  page: number;
  limit: number;
}

export const useInfiniteSearchBookmarks = ({
  q = "",
  limit = 10,
  platform = "",
  userPlatform = "",
  tags = "",
  categories = "",
  sortBy = "",
  sortOrder = "",
}: {
  q: string;
  limit: number;
  platform: string;
  userPlatform: string;
  tags: string;
  categories: string;
  sortBy: string;
  sortOrder: string;
}) => {
  return useInfiniteQuery({
    queryKey: [
      "downloads-infinite",
      q,
      limit,
      platform,
      userPlatform,
      tags,
      categories,
      sortBy,
      sortOrder,
    ],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.get<BookmarkResponse>("/search", {
        params: {
          q: q || ".",
          page: pageParam,
          limit,
          ...(platform && { platform }),
          ...(userPlatform && { userPlatform }),
          ...(tags && { tags }),
          ...(categories && { categories }),
          ...(sortBy && { sortBy }),
          ...(sortOrder && { sortOrder }),
        },
      }),
    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage;
      const totalPages = Math.ceil(total / limit);
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5000,
  });
};

export const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient.get<string[]>("/categories", {}),
  });
};

// Processing bookmarks (bookmarks being downloaded/processed)
export interface ProcessingBookmark {
  _id: string;
  link: string;
  platform: string;
  status: string;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

export const useGetProssingBookmarks = ({ limit = 50 }: { limit?: number }) => {
  return useQuery({
    queryKey: ["processing", limit],
    queryFn: () =>
      apiClient.get<ProcessingBookmark[]>("/processing", {
        params: { limit },
      }),
    refetchInterval: 0,
    refetchIntervalInBackground: true,
    staleTime: 0, // Data is considered stale immediately
    gcTime: 0, // Remove from cache immediately when component unmounts
  });
};
