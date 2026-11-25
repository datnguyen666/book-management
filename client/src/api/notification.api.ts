import { api } from './axios';

export type NotificationType =
  | 'BORROW_REQUEST'
  | 'BORROW_APPROVED'
  | 'BORROW_REJECTED'
  | 'DUE_SOON'
  | 'OVERDUE';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: NotificationType;
  link: string;
  isRead: boolean;
  readAt: string | null;
  borrowRecordId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationListResponse {
  data: Notification[];
  unreadCount: number;
  pagination: NotificationPagination;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export async function getNotifications(
  params?: GetNotificationsParams,
): Promise<NotificationListResponse> {
  const response = await api.get<NotificationListResponse>('/notifications', {
    params,
  });
  return response.data;
}

export async function markNotificationAsRead(id: number): Promise<Notification> {
  const response = await api.patch<Notification>(`/notifications/${id}/read`);
  return response.data;
}

export async function markAllNotificationsAsRead(): Promise<{
  message: string;
  count: number;
}> {
  const response = await api.patch<{ message: string; count: number }>(
    '/notifications/read-all',
  );
  return response.data;
}
