import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@modules/notification/api/notificationApi";

const invalidate = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["notifications"] });
  qc.invalidateQueries({ queryKey: ["notifications", "unread"] });
};

export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.list(),
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => notificationApi.unreadCount(),
    refetchInterval: 60000,
  });

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => invalidate(qc),
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => invalidate(qc),
  });
};
