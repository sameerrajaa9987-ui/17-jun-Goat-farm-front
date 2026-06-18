export type Gender = "male" | "female";
export type GoatStatus = "active" | "sold" | "deceased" | "transferred";
export type HealthStatus =
  | "healthy"
  | "under_treatment"
  | "critical"
  | "recovered";

export interface Ownership {
  type: "farm" | "client";
  clientUserId: string | null;
  clientName: string;
}

export interface WeightEntry {
  id: string;
  weightKg: number;
  recordedAt: string;
  note: string;
}

export interface GoatParent {
  id: string;
  goatId?: string;
  name?: string;
  breed?: string;
  gender?: Gender;
  photo?: string;
}

export interface GoatListItem {
  id: string;
  goatId: string;
  name: string;
  breed: string;
  gender: Gender;
  photo: string;
  earTagNo: string;
  status: GoatStatus;
  healthStatus: HealthStatus;
  latestWeight: number | null;
  ownership: Ownership;
  createdAt: string;
}

export interface Goat extends GoatListItem {
  qrToken: string;
  color: string;
  dateOfBirth: string | null;
  purchasePrice: number;
  currentValue: number;
  weightHistory: WeightEntry[];
  sire: GoatParent | null;
  dam: GoatParent | null;
  notes: string;
  updatedAt: string;
}

export interface GoatStats {
  total: number;
  farm: number;
  client: number;
  sick: number;
  sold: number;
  gender: { male: number; female: number };
}

export interface RegisterGoatPayload {
  name?: string;
  earTagNo?: string;
  breed?: string;
  color?: string;
  gender: Gender;
  dateOfBirth?: string | null;
  photo?: string;
  purchasePrice?: number;
  currentValue?: number;
  weightKg?: number;
  ownership?: { type: "farm" | "client"; clientUserId?: string | null };
  notes?: string;
}

export interface GoatListParams {
  ownershipType?: "farm" | "client";
  gender?: Gender;
  status?: GoatStatus;
  search?: string;
}

export interface QrResult {
  goatId: string;
  qrToken: string;
  payload: string;
  dataUrl: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}
