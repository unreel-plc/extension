import { useQuery } from "@tanstack/react-query";
import ApiClient from "@/services/api-client";
import type { DashboardResponse } from "@/types/dashboard";

export const apiClient = new ApiClient("/dashboard");

export const useDashboard = (
  {
    recentLimit = 10,
    days,
    startDate = "",
    endDate = "",
  }: {
    recentLimit: number;
    days?: number;
    startDate: string;
    endDate: string;
  },
  options?: { enabled?: boolean }
) => {
  return useQuery<DashboardResponse>({
    queryKey: [
      "dashboard",
      recentLimit,
      days ?? "",
      startDate ?? "",
      endDate ?? "",
    ],
    queryFn: () =>
      apiClient.get("", {
        params: {
          ...(recentLimit && { recentLimit }),
          ...(days && { days }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        },
      }),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    enabled: options?.enabled ?? true,
  });
};
