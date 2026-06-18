import { TaskStatus } from "@modules/task/types";

export const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  submitted: "Awaiting approval",
  approved: "Approved",
  rejected: "Rejected",
};

export const STATUS_TONE: Record<
  TaskStatus,
  "neutral" | "info" | "warning" | "success" | "danger"
> = {
  pending: "neutral",
  in_progress: "info",
  submitted: "warning",
  approved: "success",
  rejected: "danger",
};

export const PRIORITY_TONE: Record<string, "neutral" | "warning" | "danger"> = {
  low: "neutral",
  normal: "neutral",
  high: "danger",
};
