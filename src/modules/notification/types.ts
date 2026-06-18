export type NotificationType =
  | "payment_reminder"
  | "health_reminder"
  | "low_stock"
  | "task_update"
  | "goat_update"
  | "report"
  | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  priority: "low" | "normal" | "high";
  isRead: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}
