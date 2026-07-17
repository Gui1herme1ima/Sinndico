import { apiFetch } from '@/services/api/client';
import type { DashboardSummaryResponse } from '@/services/api/types';

export const dashboardApi = {
  getSummary(): Promise<DashboardSummaryResponse> {
    return apiFetch<DashboardSummaryResponse>('/api/dashboard/summary');
  },
};
