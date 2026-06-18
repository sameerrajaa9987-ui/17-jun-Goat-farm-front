export type TaskType =
  | "feed_am"
  | "feed_pm"
  | "water"
  | "clean"
  | "weigh"
  | "medicate"
  | "health_check"
  | "other";

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "submitted"
  | "approved"
  | "rejected";

export type Priority = "low" | "normal" | "high";

export interface TaskUserMini {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TaskGoatMini {
  id: string;
  goatId: string;
  name: string;
  photo: string;
  ownershipType: "farm" | "client";
}

export interface ProofItem {
  id: string;
  url: string;
  type: "image" | "video";
}

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  description: string;
  goat: TaskGoatMini | null;
  assignedTo: TaskUserMini | null;
  assignedBy: TaskUserMini | null;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  proof: ProofItem[];
  workerNote: string;
  startedAt: string | null;
  completedAt: string | null;
  approvedBy: TaskUserMini | null;
  approvedAt: string | null;
  rejectionReason: string;
  publishedToClient: boolean;
  createdAt: string;
}

export interface TaskStats {
  pendingToday: number;
  awaitingApproval: number;
  approvedToday: number;
  overdue: number;
  total: number;
}

export interface AssignTaskPayload {
  title: string;
  type?: TaskType;
  description?: string;
  goatId?: string | null;
  assignedTo: string;
  dueDate: string;
  priority?: Priority;
}

export interface TaskListParams {
  status?: TaskStatus;
  assignedTo?: string;
  type?: TaskType;
  goatId?: string;
  from?: string;
  to?: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}

export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  feed_am: "Feed (AM)",
  feed_pm: "Feed (PM)",
  water: "Water",
  clean: "Clean",
  weigh: "Weigh",
  medicate: "Medicate",
  health_check: "Health check",
  other: "Other",
};
