import { apiClient } from "@api/apiClient";
import {
  Staff,
  StaffProfile,
  StaffStats,
  Attendance,
  SalaryRecord,
  CreateStaffPayload,
  AttendanceStatus,
  Paginated,
} from "@modules/staff/types";

export const staffApi = {
  list: async (params?: { status?: string; search?: string }) => {
    const res = await apiClient.get<Paginated<Staff>>("/staff", { params });
    return res.data;
  },
  profile: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: StaffProfile }>(
      `/staff/${id}`,
    );
    return res.data.data;
  },
  create: async (payload: CreateStaffPayload) => {
    const res = await apiClient.post<{ success: boolean; data: Staff }>(
      "/staff",
      payload,
    );
    return res.data.data;
  },
  update: async (
    id: string,
    payload: Partial<CreateStaffPayload> & { status?: string },
  ) => {
    const res = await apiClient.patch<{ success: boolean; data: Staff }>(
      `/staff/${id}`,
      payload,
    );
    return res.data.data;
  },
  markAttendance: async (
    id: string,
    status: AttendanceStatus,
    date?: string,
  ) => {
    const res = await apiClient.post<{ success: boolean; data: Attendance }>(
      `/staff/${id}/attendance`,
      { status, date },
    );
    return res.data.data;
  },
  recordSalary: async (
    id: string,
    body: { month?: string; amount?: number; note?: string },
  ) => {
    const res = await apiClient.post<{ success: boolean; data: SalaryRecord }>(
      `/staff/${id}/salary`,
      body,
    );
    return res.data.data;
  },
  stats: async () => {
    const res = await apiClient.get<{ success: boolean; data: StaffStats }>(
      "/staff/stats",
    );
    return res.data.data;
  },
};
