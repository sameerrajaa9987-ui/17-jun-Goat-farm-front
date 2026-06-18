import { apiClient } from "@api/apiClient";
import { AppNotification, Paginated } from "@modules/notification/types";

export const notificationApi = {
  list: async () => {
    const res =
      await apiClient.get<Paginated<AppNotification>>("/notifications");
    return res.data;
  },
  unreadCount: async () => {
    const res = await apiClient.get<{
      success: boolean;
      data: { count: number };
    }>("/notifications/unread-count");
    return res.data.data.count;
  },
  markRead: async (id: string) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await apiClient.patch("/notifications/read-all");
    return res.data;
  },
  remove: async (id: string) => {
    const res = await apiClient.delete(`/notifications/${id}`);
    return res.data;
  },
};
