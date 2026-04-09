import { get } from "../api";

export interface DashboardStats {
  users: {
    total: number;
  };
  products: {
    pending: number;
    approved: number;
    rejected: number;
    sold: number;
    inactive: number;
    total: number;
  };
  categories: {
    total: number;
  };
  subcategories: {
    total: number;
  };
  revenue: {
    today: number;
    analysis: Array<{
      date: string;
      revenue: number;
    }>;
  };
  recentProducts: Array<any>;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    return await get<DashboardStats>("/dashboard/stats");
  },
};
