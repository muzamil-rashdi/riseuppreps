import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import type { ApiResponse, Notification } from '@/types';
import { useAuthStore } from '@/store/authStore';

const NOTIFICATIONS_KEY = ['notifications'] as const;
const POLL_INTERVAL = 30_000; // 30 seconds

async function fetchNotifications(): Promise<Notification[]> {
  const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications');
  return response.data.data;
}

async function markNotificationRead(id: string): Promise<void> {
  await apiClient.put(`/notifications/${id}/read`);
}

async function markAllNotificationsRead(): Promise<void> {
  await apiClient.put('/notifications/read-all');
}

export function useNotifications() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: fetchNotifications,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: false,
    enabled: isAuthenticated,
    staleTime: POLL_INTERVAL / 2,
  });

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (id: string) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });

      const previousNotifications = queryClient.getQueryData<Notification[]>(NOTIFICATIONS_KEY);

      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_KEY, (old) =>
        old?.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );

      return { previousNotifications };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(NOTIFICATIONS_KEY, context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });

      const previousNotifications = queryClient.getQueryData<Notification[]>(NOTIFICATIONS_KEY);

      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_KEY, (old) =>
        old?.map((n) => ({ ...n, isRead: true })),
      );

      return { previousNotifications };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(NOTIFICATIONS_KEY, context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });

  const markAsRead = useCallback(
    (id: string) => {
      markAsReadMutation.mutate(id);
    },
    [markAsReadMutation],
  );

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  };
}
