import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ChevronLeft,
  Phone,
  BadgeIndianRupee,
  CalendarCheck,
} from "lucide-react-native";
import { format } from "date-fns";
import {
  useStaffProfile,
  useMarkAttendance,
  useRecordSalary,
} from "@modules/staff/hooks/useStaff";
import { AttendanceStatus, ATTENDANCE_LABEL } from "@modules/staff/types";
import { palette, radius } from "@shared/designSystem";
import { Text, VStack, HStack, Card, StatusChip } from "@shared/ui";

const ATT_STATUSES: AttendanceStatus[] = [
  "present",
  "half_day",
  "leave",
  "absent",
];
const ATT_TONE: Record<
  AttendanceStatus,
  "success" | "warning" | "info" | "danger"
> = {
  present: "success",
  half_day: "warning",
  leave: "info",
  absent: "danger",
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

export default function StaffProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id as string;
  const { data, isLoading } = useStaffProfile(id);
  const mark = useMarkAttendance(id);
  const paySalary = useRecordSalary(id);

  if (isLoading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={palette.ink[700]} />
      </View>
    );
  }

  const { staff, attendance, salary } = data;
  const today = todayKey();
  const todayAtt = attendance.find((a) => a.date === today);
  const thisMonth = monthKey();
  const paidThisMonth = salary.find((s) => s.month === thisMonth);

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.topbar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <ChevronLeft size={26} color={palette.text.primary} />
          </Pressable>
          <Text variant="h3" tone="primary">
            Staff
          </Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Identity */}
          <Card>
            <HStack gap={14} align="center">
              <View style={styles.avatar}>
                <Text variant="display-sm" tone="inverse">
                  {staff.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <VStack gap={5} flex={1}>
                <Text variant="h2" tone="primary">
                  {staff.name}
                </Text>
                <StatusChip label={staff.designation} tone="info" />
              </VStack>
            </HStack>
            <View style={styles.divider} />
            <VStack gap={10}>
              {staff.phone ? (
                <Row
                  icon={<Phone size={16} color={palette.text.tertiary} />}
                  text={staff.phone}
                />
              ) : null}
              <Row
                icon={
                  <BadgeIndianRupee size={16} color={palette.text.tertiary} />
                }
                text={`₹${staff.salaryAmount.toLocaleString("en-IN")} / ${staff.salaryCycle}`}
              />
              <Row
                icon={<CalendarCheck size={16} color={palette.text.tertiary} />}
                text={`Joined ${format(new Date(staff.joinDate), "dd MMM yyyy")}`}
              />
            </VStack>
          </Card>

          {/* Today attendance */}
          <Card style={{ marginTop: 16 }}>
            <HStack
              justify="space-between"
              align="center"
              style={{ marginBottom: 12 }}
            >
              <Text variant="h4" tone="primary">
                Today
              </Text>
              {todayAtt ? (
                <StatusChip
                  label={ATTENDANCE_LABEL[todayAtt.status]}
                  tone={ATT_TONE[todayAtt.status]}
                />
              ) : (
                <Text variant="caption" tone="tertiary">
                  Not marked
                </Text>
              )}
            </HStack>
            <View style={styles.attRow}>
              {ATT_STATUSES.map((s) => {
                const active = todayAtt?.status === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => mark.mutate({ status: s })}
                    disabled={mark.isPending}
                    style={[styles.attChip, active && styles.attChipActive]}
                  >
                    <Text
                      variant="label"
                      style={{
                        color: active
                          ? palette.text.inverse
                          : palette.text.secondary,
                      }}
                    >
                      {ATTENDANCE_LABEL[s]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          {/* Recent attendance */}
          {attendance.length > 0 && (
            <Card style={{ marginTop: 16 }}>
              <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
                Recent attendance
              </Text>
              <VStack gap={8}>
                {attendance.slice(0, 8).map((a) => (
                  <HStack key={a.id} justify="space-between" align="center">
                    <Text variant="body-sm" tone="secondary">
                      {format(new Date(a.date), "EEE dd MMM")}
                    </Text>
                    <StatusChip
                      label={ATTENDANCE_LABEL[a.status]}
                      tone={ATT_TONE[a.status]}
                    />
                  </HStack>
                ))}
              </VStack>
            </Card>
          )}

          {/* Salary */}
          <Card style={{ marginTop: 16 }}>
            <HStack
              justify="space-between"
              align="center"
              style={{ marginBottom: 12 }}
            >
              <Text variant="h4" tone="primary">
                Salary
              </Text>
              {paidThisMonth ? (
                <StatusChip label={`${thisMonth} paid`} tone="success" />
              ) : (
                <Pressable
                  onPress={() =>
                    paySalary.mutate({
                      month: thisMonth,
                      amount: staff.salaryAmount,
                    })
                  }
                  disabled={paySalary.isPending}
                  style={styles.payBtn}
                >
                  <Text variant="label" tone="inverse">
                    Pay this month
                  </Text>
                </Pressable>
              )}
            </HStack>
            {salary.length === 0 ? (
              <Text variant="body-sm" tone="tertiary">
                No salary records yet.
              </Text>
            ) : (
              <VStack gap={8}>
                {salary.slice(0, 8).map((s) => (
                  <HStack key={s.id} justify="space-between" align="center">
                    <Text variant="body-sm" tone="secondary">
                      {s.month}
                    </Text>
                    <HStack gap={8} align="center">
                      <Text variant="label" tone="primary">
                        ₹{s.amount.toLocaleString("en-IN")}
                      </Text>
                      <StatusChip
                        label={s.status}
                        tone={s.status === "paid" ? "success" : "warning"}
                      />
                    </HStack>
                  </HStack>
                ))}
              </VStack>
            )}
          </Card>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <HStack gap={10} align="center">
      {icon}
      <Text variant="body-sm" tone="secondary">
        {text}
      </Text>
    </HStack>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface.secondary,
  },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: palette.ink[900],
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: palette.border.subtle,
    marginVertical: 16,
  },
  attRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  attChip: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  attChipActive: {
    backgroundColor: palette.ink[900],
    borderColor: palette.ink[900],
  },
  payBtn: {
    backgroundColor: palette.ink[900],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
});
