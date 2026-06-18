import { AppliedHealthStatus, HealthRecordStatus } from "@modules/health/types";

export const HEALTH_STATUS_TONE: Record<
  string,
  "success" | "warning" | "danger" | "info" | "neutral"
> = {
  healthy: "success",
  recovered: "info",
  under_treatment: "warning",
  critical: "danger",
};

export const RECORD_STATUS_TONE: Record<
  HealthRecordStatus,
  "success" | "warning" | "danger" | "neutral"
> = {
  completed: "success",
  scheduled: "neutral",
  overdue: "danger",
  cancelled: "neutral",
};

export const APPLIED_LABEL: Record<AppliedHealthStatus, string> = {
  healthy: "Healthy",
  under_treatment: "Under treatment",
  critical: "Critical",
  recovered: "Recovered",
};
