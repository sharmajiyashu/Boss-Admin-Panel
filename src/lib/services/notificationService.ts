import { get, post, patch } from "../api";

export interface INotification {
  _id: string;
  title: string;
  message: string;
  recipient: string;
  sender?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  };
  type: string;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface INotificationsResponse {
  notifications: INotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export const notificationService = {
  getNotifications: async (page = 1, limit = 10): Promise<INotificationsResponse> => {
    return get<INotificationsResponse>(`/admin/notifications?page=${page}&limit=${limit}`);
  },

  sendBroadcast: async (title: string, message: string): Promise<INotification> => {
    return post<INotification>("/admin/notifications/send-all", { title, message });
  },

  markAsRead: async (id: string): Promise<{ success: boolean }> => {
    return patch<{ success: boolean }>(`/admin/notifications/${id}/read`, {});
  }
};
