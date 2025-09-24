import ApiClient from "@/services/api-client";
import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import type { Bookmark } from "./use-engine";

export const apiClient = new ApiClient("/archives");
export interface Archive {
  _id: string;
  user: string;
  name: string;
  description: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ArchiveResponse {
  results: Archive[];
  total: number;
  page: number;
  limit: number;
}

export interface ArchiveItemsResponse {
  results: Bookmark[];
  total: number;
  page: number;
  limit: number;
}

//archive functionality
export const useGetArchives = ({
  q = "",
  page = 1,
  limit = 10,
  isDefault = false,
  sortBy = "",
  sortOrder = "",
}: {
  q: string;
  page: number;
  limit: number;
  isDefault: boolean;
  sortBy: string;
  sortOrder: string;
}) => {
  return useQuery({
    queryKey: ["archives", q, limit, isDefault, sortBy, sortOrder],
    queryFn: () =>
      apiClient.get("", {
        params: {
          q: q,
          page: page,
          limit,
          ...(isDefault && { isDefault }),
          ...(sortBy && { sortBy }),
          ...(sortOrder && { sortOrder }),
        },
      }),
  });
};

export const useCreateArchive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      apiClient.post("", data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["archives"],
      });
    },
  });
};

export const useUpdateArchive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      description,
    }: {
      id: string;
      name: string;
      description: string;
    }) => apiClient.patch(`/${id}`, { name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["archives"],
      });
    },
  });
};

export const useDeleteArchive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["archives"],
      });
    },
  });
};

// Infinite scroll hook for archives
export const useInfiniteArchives = ({
  q = "",
  limit = 10,
  isDefault = false,
  sortBy = "",
  sortOrder = "",
}: {
  q: string;
  limit: number;
  isDefault: boolean;
  sortBy: string;
  sortOrder: string;
}) => {
  return useInfiniteQuery({
    queryKey: ["archives-infinite", q, limit, isDefault, sortBy, sortOrder],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.get<ArchiveResponse>("", {
        params: {
          q: q,
          page: pageParam,
          limit,
          ...(isDefault && { isDefault }),
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
  });
};

/// items inside archives
export const useInfiniteArchiveItems = ({
  archiveId,
  q = "",
  limit = 10,
  platform = "",
  tags = "",
  categories = "",
  sortBy = "",
  sortOrder = "",
}: {
  archiveId: string;
  platform: string;
  tags: string;
  categories: string;
  q: string;
  limit: number;
  sortBy: string;
  sortOrder: string;
}) => {
  return useInfiniteQuery({
    queryKey: [
      "archive-items-infinite",
      archiveId,
      q,
      limit,
      platform,
      tags,
      categories,
      sortBy,
      sortOrder,
    ],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.get<ArchiveItemsResponse>(`/${archiveId}/search`, {
        params: {
          id: archiveId,
          q: q,
          page: pageParam,
          limit,
          ...(platform && { platform }),
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
  });
};

export const useAddItem = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { downloadId: string }) =>
      apiClient.post(`/${id}/items`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["archive-items-infinite"],
      });
    },
  });
};

export const useRemoveItem = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { downloadId: string }) =>
      apiClient.delete(`/${id}/items`, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["archive-items-infinite"],
      });
    },
  });
};
