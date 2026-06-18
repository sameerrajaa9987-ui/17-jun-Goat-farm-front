export type AttendanceStatus = "present" | "absent" | "half_day" | "leave";

export interface Staff {
  id: string;
  name: string;
  designation: string;
  phone: string;
  photo: string;
  user: { id: string; email: string; role: string } | null;
  joinDate: string;
  salaryAmount: number;
  salaryCycle: "monthly" | "weekly" | "daily";
  status: "active" | "inactive";
  notes: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  staffId: string;
  date: string;
  status: AttendanceStatus;
  note: string;
}

export interface SalaryRecord {
  id: string;
  staffId: string;
  month: string;
  amount: number;
  status: "pending" | "paid";
  paidDate: string;
  note: string;
}

export interface StaffProfile {
  staff: Staff;
  attendance: Attendance[];
  salary: SalaryRecord[];
}

export interface StaffStats {
  activeStaff: number;
  presentToday: number;
  absentToday: number;
  salaryPaidThisMonth: number;
}

export interface CreateStaffPayload {
  name: string;
  designation?: string;
  phone?: string;
  salaryAmount?: number;
  salaryCycle?: "monthly" | "weekly" | "daily";
  notes?: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}

export const ATTENDANCE_LABEL: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  half_day: "Half day",
  leave: "Leave",
};
