export type DocumentType =
  | "agreement"
  | "ownership_certificate"
  | "vaccination_certificate"
  | "medical_report"
  | "purchase_bill"
  | "kyc"
  | "other";

export interface FarmDocument {
  id: string;
  title: string;
  type: DocumentType;
  url: string;
  mimeType: string;
  relatedGoat: { id: string; goatId?: string; name?: string } | null;
  relatedClient: string | null;
  notes: string;
  uploadedBy: { id: string; name: string } | null;
  createdAt: string;
}

export interface CreateDocPayload {
  title: string;
  type?: DocumentType;
  url: string;
  mimeType?: string;
  relatedGoat?: string | null;
  relatedClient?: string | null;
  notes?: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}

export const DOC_TYPE_LABEL: Record<DocumentType, string> = {
  agreement: "Agreement",
  ownership_certificate: "Ownership certificate",
  vaccination_certificate: "Vaccination certificate",
  medical_report: "Medical report",
  purchase_bill: "Purchase bill",
  kyc: "KYC",
  other: "Other",
};
