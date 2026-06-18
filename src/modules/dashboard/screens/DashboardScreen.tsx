import React from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  PawPrint,
  ClipboardList,
  HeartPulse,
  Boxes,
  Users,
  ReceiptIndianRupee,
  TrendingUp,
  ScrollText,
  Bell,
  ChevronRight,
  CalendarCheck,
  CheckCheck,
  type LucideIcon,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore, Role } from "@shared/store/useAuthStore";
import { useGoatStats } from "@modules/goat/hooks/useGoats";
import { useTaskStats } from "@modules/task/hooks/useTasks";
import { useUnreadCount } from "@modules/notification/hooks/useNotifications";
import { palette, radius, glass } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  Card,
  StatusChip,
  GradientHero,
  StatTile,
} from "@shared/ui";

type Feature = {
  key: string;
  label: string;
  icon: LucideIcon;
  phase: number;
  tint: { bg: string; fg: string };
};

const ALL_FEATURES: Record<string, Feature> = {
  goats: {
    key: "goats",
    label: "Goat Registry",
    icon: PawPrint,
    phase: 2,
    tint: { bg: palette.ink[50], fg: palette.ink[600] },
  },
  tasks: {
    key: "tasks",
    label: "Daily Tasks",
    icon: ClipboardList,
    phase: 3,
    tint: { bg: palette.info.bg, fg: palette.info.text },
  },
  health: {
    key: "health",
    label: "Health & Vaccines",
    icon: HeartPulse,
    phase: 4,
    tint: { bg: palette.danger.bg, fg: palette.danger.text },
  },
  inventory: {
    key: "inventory",
    label: "Inventory",
    icon: Boxes,
    phase: 5,
    tint: { bg: palette.amber[50], fg: palette.amber[600] },
  },
  staff: {
    key: "staff",
    label: "Staff",
    icon: Users,
    phase: 5,
    tint: { bg: palette.success.bg, fg: palette.success.text },
  },
  billing: {
    key: "billing",
    label: "Ad Pali Billing",
    icon: ReceiptIndianRupee,
    phase: 6,
    tint: { bg: palette.amber[50], fg: palette.amber[600] },
  },
  finance: {
    key: "finance",
    label: "Sales & Finance",
    icon: TrendingUp,
    phase: 7,
    tint: { bg: palette.ink[50], fg: palette.ink[600] },
  },
  reports: {
    key: "reports",
    label: "Reports",
    icon: ScrollText,
    phase: 8,
    tint: { bg: palette.warning.bg, fg: palette.warning.text },
  },
};

const ROLE_FEATURES: Record<Role, string[]> = {
  owner: [
    "goats",
    "tasks",
    "health",
    "inventory",
    "staff",
    "billing",
    "finance",
    "reports",
  ],
  manager: [
    "goats",
    "tasks",
    "health",
    "inventory",
    "staff",
    "billing",
    "finance",
    "reports",
  ],
  worker: ["goats", "tasks"],
  vet: ["goats", "health"],
  client: ["goats", "billing"],
};

const ROLE_SUBTITLE: Record<Role, string> = {
  owner: "dashboard.ownerSubtitle",
  manager: "dashboard.managerSubtitle",
  worker: "dashboard.workerSubtitle",
  vet: "dashboard.vetSubtitle",
  client: "dashboard.clientSubtitle",
};

const LIVE_TAB: Record<string, string> = {
  goats: "Goats",
  tasks: "Tasks",
  health: "Health",
  inventory: "Inventory",
  staff: "Staff",
  finance: "Finance",
  reports: "Reports",
};

export default function DashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const { data: stats } = useGoatStats();
  const isClient = user?.role === "client";
  const { data: taskStats } = useTaskStats(!isClient);
  const { data: unread } = useUnreadCount();
  if (!user) return null;

  const features = (ROLE_FEATURES[user.role] || []).map((k) => ALL_FEATURES[k]);
  const healthy = stats
    ? Math.max(0, stats.total - stats.sick - stats.sold)
    : 0;

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Atmospheric hero */}
          <GradientHero>
            <HStack justify="space-between" align="flex-start">
              <VStack gap={3} flex={1}>
                <Text
                  variant="label-sm"
                  style={{ color: "rgba(255,255,255,0.66)" }}
                >
                  {t("dashboard.greeting", {
                    name: user.firstName,
                  }).toUpperCase()}
                </Text>
                <Text variant="h1" tone="inverse">
                  {t(`roles.${user.role}`)}
                </Text>
                <Text
                  variant="body-sm"
                  style={{ color: "rgba(255,255,255,0.74)" }}
                >
                  {t(ROLE_SUBTITLE[user.role])}
                </Text>
              </VStack>
              <HStack gap={10} align="center">
                <Pressable
                  onPress={() => navigation.navigate("Notifications")}
                  hitSlop={8}
                  style={[styles.bell, glass.light]}
                >
                  <Bell size={20} color="#FFFFFF" strokeWidth={1.8} />
                  {unread && unread > 0 ? (
                    <View style={styles.badge}>
                      <Text variant="label-sm" tone="inverse">
                        {unread > 9 ? "9+" : unread}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
                <View style={[styles.avatar, glass.light]}>
                  <Text variant="h2" tone="inverse">
                    {user.firstName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </HStack>
            </HStack>

            {/* Headline metric */}
            <View style={styles.heroMetric}>
              <Text variant="display-lg" tone="inverse">
                {stats ? String(stats.total) : "—"}
              </Text>
              <Text
                variant="body-sm"
                style={{ color: "rgba(255,255,255,0.74)", marginBottom: 6 }}
              >
                {isClient ? "goats in your care" : "goats on the farm"}
              </Text>
            </View>
          </GradientHero>

          {/* Bento stat row */}
          <HStack gap={12} style={{ marginTop: 12 }}>
            {isClient ? (
              <>
                <StatTile
                  label="Healthy"
                  value={stats ? String(healthy) : "—"}
                  icon={HeartPulse}
                  tone="forest"
                />
                <StatTile
                  label="On care"
                  value={stats ? String(stats.client) : "—"}
                  icon={PawPrint}
                />
              </>
            ) : (
              <>
                <StatTile
                  label="Tasks today"
                  value={taskStats ? String(taskStats.pendingToday) : "—"}
                  icon={CalendarCheck}
                  tone="clay"
                  onPress={() => navigation.navigate("Tasks")}
                />
                <StatTile
                  label="To approve"
                  value={taskStats ? String(taskStats.awaitingApproval) : "—"}
                  icon={CheckCheck}
                  hint={
                    taskStats && taskStats.awaitingApproval > 0
                      ? "needs review"
                      : "all clear"
                  }
                  onPress={() => navigation.navigate("Tasks")}
                />
              </>
            )}
          </HStack>

          {/* Modules — bento grid */}
          <Text variant="overline" tone="tertiary" style={styles.sectionLabel}>
            Your modules
          </Text>
          <View style={styles.grid}>
            {features.map((f) => {
              const Icon = f.icon;
              const target =
                isClient && f.key === "billing" ? "Bills" : LIVE_TAB[f.key];
              const live = !!target;
              return (
                <Card
                  key={f.key}
                  style={styles.tile}
                  elevation="raised"
                  onPress={live ? () => navigation.navigate(target) : undefined}
                >
                  <HStack justify="space-between" align="center">
                    <View
                      style={[styles.iconWrap, { backgroundColor: f.tint.bg }]}
                    >
                      <Icon color={f.tint.fg} size={22} strokeWidth={2} />
                    </View>
                    {live ? (
                      <ChevronRight
                        size={18}
                        color={palette.text.tertiary}
                        strokeWidth={2}
                      />
                    ) : null}
                  </HStack>
                  <Text
                    variant="label-lg"
                    tone="primary"
                    style={{ marginTop: 14 }}
                  >
                    {f.label}
                  </Text>
                  <View style={{ marginTop: 8, alignSelf: "flex-start" }}>
                    {live ? (
                      <StatusChip label="Open" tone="success" />
                    ) : (
                      <StatusChip label={`Phase ${f.phase}`} tone="warning" />
                    )}
                  </View>
                </Card>
              );
            })}
          </View>

          <Card style={{ marginTop: 16 }}>
            <Text variant="body-sm" tone="tertiary">
              {t("dashboard.comingSoon")} — modules unlock as each phase ships.
              You are signed in as{" "}
              <Text variant="label" tone="accent">
                {t(`roles.${user.role}`)}
              </Text>
              , so you only see what your role can access.
            </Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bell: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: palette.amber[500],
    alignItems: "center",
    justifyContent: "center",
  },
  heroMetric: { marginTop: 22 },
  sectionLabel: { marginTop: 26, marginBottom: 12, marginLeft: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { width: "47.5%" },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
