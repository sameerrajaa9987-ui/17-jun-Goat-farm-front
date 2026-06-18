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
  type LucideIcon,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore, Role } from "@shared/store/useAuthStore";
import { useGoatStats } from "@modules/goat/hooks/useGoats";
import { useTaskStats } from "@modules/task/hooks/useTasks";
import { useUnreadCount } from "@modules/notification/hooks/useNotifications";
import { palette, radius, shadows } from "@shared/designSystem";
import { Text, VStack, HStack, Card, StatusChip } from "@shared/ui";

type Feature = { key: string; label: string; icon: LucideIcon; phase: number };

const ALL_FEATURES: Record<string, Feature> = {
  goats: { key: "goats", label: "Goat Registry", icon: PawPrint, phase: 2 },
  tasks: { key: "tasks", label: "Daily Tasks", icon: ClipboardList, phase: 3 },
  health: {
    key: "health",
    label: "Health & Vaccines",
    icon: HeartPulse,
    phase: 4,
  },
  inventory: { key: "inventory", label: "Inventory", icon: Boxes, phase: 5 },
  staff: { key: "staff", label: "Staff", icon: Users, phase: 5 },
  billing: {
    key: "billing",
    label: "Ad Pali Billing",
    icon: ReceiptIndianRupee,
    phase: 6,
  },
  finance: {
    key: "finance",
    label: "Sales & Finance",
    icon: TrendingUp,
    phase: 7,
  },
  reports: { key: "reports", label: "Reports", icon: ScrollText, phase: 8 },
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

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <HStack justify="space-between" align="center">
            <VStack gap={4} flex={1}>
              <Text variant="body" tone="tertiary">
                {t("dashboard.greeting", { name: user.firstName })}
              </Text>
              <Text variant="h1" tone="primary">
                {t(`roles.${user.role}`)}
              </Text>
              <Text variant="body-sm" tone="secondary">
                {t(ROLE_SUBTITLE[user.role])}
              </Text>
            </VStack>
            <HStack gap={12} align="center">
              <Pressable
                onPress={() => navigation.navigate("Notifications")}
                hitSlop={8}
                style={styles.bell}
              >
                <Bell size={22} color={palette.ink[800]} strokeWidth={1.8} />
                {unread && unread > 0 ? (
                  <View style={styles.badge}>
                    <Text variant="label-sm" tone="inverse">
                      {unread > 9 ? "9+" : unread}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
              <View style={styles.avatar}>
                <Text variant="h2" tone="inverse">
                  {user.firstName.charAt(0).toUpperCase()}
                </Text>
              </View>
            </HStack>
          </HStack>

          {/* Live stats */}
          <HStack gap={12} style={{ marginTop: 24 }}>
            <StatCard
              label={isClient ? "My goats" : "Total goats"}
              value={stats ? String(stats.total) : "—"}
            />
            {isClient ? (
              <StatCard
                label="Healthy"
                value={
                  stats
                    ? String(Math.max(0, stats.total - stats.sick - stats.sold))
                    : "—"
                }
              />
            ) : (
              <StatCard
                label="Tasks today"
                value={taskStats ? String(taskStats.pendingToday) : "—"}
              />
            )}
            {isClient ? (
              <StatCard
                label="On care"
                value={stats ? String(stats.client) : "—"}
              />
            ) : (
              <StatCard
                label="To approve"
                value={taskStats ? String(taskStats.awaitingApproval) : "—"}
              />
            )}
          </HStack>

          {/* Feature grid */}
          <Text
            variant="h3"
            tone="primary"
            style={{ marginTop: 28, marginBottom: 12 }}
          >
            Your modules
          </Text>
          <View style={styles.grid}>
            {features.map((f) => {
              const Icon = f.icon;
              const liveTab: Record<string, string> = {
                goats: "Goats",
                tasks: "Tasks",
                health: "Health",
                inventory: "Inventory",
                staff: "Staff",
                billing: isClient ? "Bills" : "ClientList",
                finance: "Finance",
                reports: "Reports",
              };
              const target = liveTab[f.key]; // shipped modules map to a tab/screen
              const live = !!target;
              return (
                <Card
                  key={f.key}
                  style={styles.tile}
                  onPress={live ? () => navigation.navigate(target) : undefined}
                >
                  <View style={styles.iconWrap}>
                    <Icon
                      color={palette.ink[700]}
                      size={22}
                      strokeWidth={1.8}
                    />
                  </View>
                  <Text
                    variant="label-lg"
                    tone="primary"
                    style={{ marginTop: 12 }}
                  >
                    {f.label}
                  </Text>
                  <View style={{ marginTop: 8 }}>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="display-sm" tone="primary">
        {value}
      </Text>
      <Text variant="caption" tone="tertiary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: palette.ink[900],
    alignItems: "center",
    justifyContent: "center",
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: palette.surface.primary,
    borderWidth: 1,
    borderColor: palette.border.default,
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
  stat: {
    flex: 1,
    backgroundColor: palette.surface.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 14,
    ...shadows.xs,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { width: "47.5%" },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: palette.ink[50],
    alignItems: "center",
    justifyContent: "center",
  },
});
