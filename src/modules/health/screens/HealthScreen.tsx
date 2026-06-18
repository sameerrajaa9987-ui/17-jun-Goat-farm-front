import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ChevronLeft,
  BellRing,
  TriangleAlert,
  CalendarClock,
  Check,
} from "lucide-react-native";
import {
  useHealthAlerts,
  useHealthSchedule,
  useCompleteScheduled,
  useRunReminders,
} from "@modules/health/hooks/useHealth";
import { HealthRecordRow } from "@modules/health/components/HealthRecordRow";
import { mediaUrl } from "@modules/goat/screens/GoatListScreen";
import { useAuthStore } from "@shared/store/useAuthStore";
import { palette, radius, elevation } from "@shared/designSystem";
import { Text, VStack, HStack, StatusChip, Card } from "@shared/ui";

const TABS = [
  { key: "alerts", label: "Alerts" },
  { key: "schedule", label: "Schedule" },
] as const;

export default function HealthScreen() {
  const navigation = useNavigation<any>();
  const role = useAuthStore((s) => s.user?.role);
  const canManage = role === "owner" || role === "manager";
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("alerts");

  const alerts = useHealthAlerts();
  const schedule = useHealthSchedule();
  const complete = useCompleteScheduled();
  const runReminders = useRunReminders();

  const refreshing = alerts.isRefetching || schedule.isRefetching;
  const onRefresh = () => {
    alerts.refetch();
    schedule.refetch();
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.topbar}>
          {navigation.canGoBack() ? (
            <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
              <ChevronLeft size={26} color={palette.text.primary} />
            </Pressable>
          ) : (
            <View style={{ width: 26 }} />
          )}
          <Text variant="h3" tone="primary">
            Health
          </Text>
          {canManage ? (
            <Pressable onPress={() => runReminders.mutate()} hitSlop={10}>
              <BellRing
                size={22}
                color={
                  runReminders.isPending
                    ? palette.text.disabled
                    : palette.ink[800]
                }
              />
            </Pressable>
          ) : (
            <View style={{ width: 26 }} />
          )}
        </View>

        <View style={styles.tabs}>
          {TABS.map((tb) => {
            const active = tab === tb.key;
            return (
              <Pressable
                key={tb.key}
                onPress={() => setTab(tb.key)}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text
                  variant="label-lg"
                  style={{
                    color: active
                      ? palette.text.inverse
                      : palette.text.secondary,
                  }}
                >
                  {tb.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={palette.ink[700]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {tab === "alerts" ? (
            <VStack gap={16}>
              <HStack gap={12}>
                <AlertStat
                  icon={<TriangleAlert size={18} color={palette.danger.text} />}
                  label="Sick"
                  value={alerts.data?.sickCount ?? 0}
                  tone={palette.danger}
                />
                <AlertStat
                  icon={
                    <CalendarClock size={18} color={palette.warning.text} />
                  }
                  label="Overdue"
                  value={alerts.data?.overdueCount ?? 0}
                  tone={palette.warning}
                />
                <AlertStat
                  icon={<CalendarClock size={18} color={palette.info.text} />}
                  label="Due soon"
                  value={alerts.data?.dueSoonCount ?? 0}
                  tone={palette.info}
                />
              </HStack>

              {(alerts.data?.sick?.length ?? 0) > 0 && (
                <VStack gap={10}>
                  <Text variant="h4" tone="primary">
                    Sick goats
                  </Text>
                  {alerts.data!.sick.map((g) => (
                    <Card
                      key={g.id}
                      onPress={() =>
                        navigation.navigate("GoatHealth", { id: g.id })
                      }
                      elevation="raised"
                      padded={false}
                      style={styles.sickRow}
                    >
                      {g.photo ? (
                        <Image
                          source={{ uri: mediaUrl(g.photo) }}
                          style={styles.sickPhoto}
                        />
                      ) : (
                        <View
                          style={[
                            styles.sickPhoto,
                            { backgroundColor: palette.ink[50] },
                          ]}
                        />
                      )}
                      <VStack gap={3} flex={1}>
                        <Text variant="label-lg" tone="primary">
                          {g.name || g.goatId}
                        </Text>
                        <StatusChip
                          label={g.healthStatus.replace("_", " ")}
                          tone={
                            g.healthStatus === "critical" ? "danger" : "warning"
                          }
                        />
                      </VStack>
                    </Card>
                  ))}
                </VStack>
              )}

              {(alerts.data?.overdue?.length ?? 0) > 0 && (
                <VStack gap={10}>
                  <Text variant="h4" tone="primary">
                    Overdue
                  </Text>
                  {alerts.data!.overdue.map((r) => (
                    <HealthRecordRow
                      key={r.id}
                      record={r}
                      showGoat
                      trailing={
                        canManage ? (
                          <CompleteBtn
                            busy={complete.isPending}
                            onPress={() =>
                              complete.mutate({ id: r.id, body: {} })
                            }
                          />
                        ) : undefined
                      }
                    />
                  ))}
                </VStack>
              )}

              {alerts.data &&
              alerts.data.sickCount === 0 &&
              alerts.data.overdueCount === 0 &&
              alerts.data.dueSoonCount === 0 ? (
                <Text
                  variant="body"
                  tone="tertiary"
                  align="center"
                  style={{ marginTop: 40 }}
                >
                  All healthy — nothing needs attention.
                </Text>
              ) : null}
            </VStack>
          ) : (
            <VStack gap={12}>
              {(schedule.data?.length ?? 0) === 0 ? (
                <Text
                  variant="body"
                  tone="tertiary"
                  align="center"
                  style={{ marginTop: 40 }}
                >
                  No upcoming vaccinations or dewormings.
                </Text>
              ) : (
                schedule.data!.map((r) => (
                  <HealthRecordRow
                    key={r.id}
                    record={r}
                    showGoat
                    onPress={() =>
                      r.goat &&
                      navigation.navigate("GoatHealth", { id: r.goat.id })
                    }
                    trailing={
                      canManage ? (
                        <CompleteBtn
                          busy={complete.isPending}
                          onPress={() =>
                            complete.mutate({ id: r.id, body: {} })
                          }
                        />
                      ) : undefined
                    }
                  />
                ))
              )}
            </VStack>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function AlertStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: { bg: string; border: string };
}) {
  return (
    <View
      style={[
        styles.alertStat,
        { backgroundColor: tone.bg, borderColor: tone.border },
      ]}
    >
      {icon}
      <Text variant="display-sm" tone="primary" style={{ marginTop: 6 }}>
        {value}
      </Text>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

function CompleteBtn({
  onPress,
  busy,
}: {
  onPress: () => void;
  busy: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={styles.completeBtn}
      hitSlop={6}
    >
      <Check size={16} color={palette.text.inverse} strokeWidth={2.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  tabActive: {
    backgroundColor: palette.ink[900],
    borderColor: palette.ink[900],
  },
  alertStat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: radius.xl,
    borderWidth: 1,
    ...elevation.raised,
  },
  sickRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
  },
  sickPhoto: { width: 48, height: 48, borderRadius: radius.md },
  completeBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: palette.ink[900],
    alignItems: "center",
    justifyContent: "center",
  },
});
