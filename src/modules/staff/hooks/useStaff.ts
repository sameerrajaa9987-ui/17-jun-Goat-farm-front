import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "@modules/staff/api/staffApi";
import { CreateStaffPayload, AttendanceStatus } from "@modules/staff/types";

const invalidate = (qc: ReturnType<typeof useQueryClient>, id?: string) => {
  qc.invalidateQueries({ queryKey: ["staff"] });
  if (id) qc.invalidateQueries({ queryKey: ["staff-profile", id] });
};

export const useStaffList = (params?: { status?: string; search?: string }) =>
  useQuery({
    queryKey: ["staff", params],
    queryFn: () => staffApi.list(params),
  });

export const useStaffProfile = (id: string) =>
  useQuery({
    queryKey: ["staff-profile", id],
    queryFn: () => staffApi.profile(id),
    enabled: !!id,
  });

export const useStaffStats = (enabled = true) =>
  useQuery({
    queryKey: ["staff", "stats"],
    queryFn: () => staffApi.stats(),
    enabled,
  });

export const useCreateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => staffApi.create(payload),
    onSuccess: () => invalidate(qc),
  });
};

export const useMarkAttendance = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      status,
      date,
    }: {
      status: AttendanceStatus;
      date?: string;
    }) => staffApi.markAttendance(id, status, date),
    onSuccess: () => invalidate(qc, id),
  });
};

export const useRecordSalary = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { month?: string; amount?: number; note?: string }) =>
      staffApi.recordSalary(id, body),
    onSuccess: () => invalidate(qc, id),
  });
};

export const useVoidSalary = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (month: string) => staffApi.voidSalary(id, month),
    onSuccess: () => invalidate(qc, id),
  });
};
