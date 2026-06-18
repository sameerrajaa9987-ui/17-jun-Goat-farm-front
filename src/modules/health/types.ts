export type HealthType =
  | "diagnosis"
  | "treatment"
  | "vaccination"
  | "deworming"
  | "checkup"
  | "prescription"
  | "note";

export type HealthRecordStatus =
  | "completed"
  | "scheduled"
  | "overdue"
  | "cancelled";
export type AppliedHealthStatus =
  | "healthy"
  | "under_treatment"
  | "critical"
  | "recovered";

export interface HealthGoatMini {
  id: string;
  goatId: string;
  name: string;
  photo: string;
  healthStatus: string;
  ownershipType: "farm" | "client";
}

export interface HealthRecord {
  id: string;
  goat: HealthGoatMini | null;
  type: HealthType;
  title: string;
  description: string;
  medicine: string;
  dosage: string;
  vetNotes: string;
  appliedHealthStatus: AppliedHealthStatus | null;
  recordedBy: { id: string; name: string; role: string } | null;
  status: HealthRecordStatus;
  performedAt: string | null;
  dueDate: string | null;
  completedAt: string | null;
  reminderSent: boolean;
  attachments: { id: string; url: string; type: string }[];
  createdAt: string;
}

export interface SickGoat {
  id: string;
  goatId: string;
  name: string;
  photo: string;
  healthStatus: string;
}

export interface HealthAlerts {
  sickCount: number;
  overdueCount: number;
  dueSoonCount: number;
  sick: SickGoat[];
  overdue: HealthRecord[];
  dueSoon: HealthRecord[];
}

export interface HealthStats {
  vaccinations: number;
  dewormings: number;
  treatments: number;
  scheduled: number;
  overdue: number;
}

export interface CreateHealthPayload {
  goatId: string;
  type: HealthType;
  title: string;
  description?: string;
  medicine?: string;
  dosage?: string;
  vetNotes?: string;
  appliedHealthStatus?: AppliedHealthStatus;
  performedAt?: string;
  dueDate?: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}

export const HEALTH_TYPE_LABEL: Record<HealthType, string> = {
  diagnosis: "Diagnosis",
  treatment: "Treatment",
  vaccination: "Vaccination",
  deworming: "Deworming",
  checkup: "Checkup",
  prescription: "Prescription",
  note: "Note",
};

export const HEALTH_STATUS_LABEL: Record<AppliedHealthStatus, string> = {
  healthy: "Healthy",
  under_treatment: "Under treatment",
  critical: "Critical",
  recovered: "Recovered",
};
