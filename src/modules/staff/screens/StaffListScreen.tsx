import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Plus, Users } from "lucide-react-native";
import { useStaffList, useStaffStats } from "@modules/staff/hooks/useStaff";
import { Staff } from "@modules/staff/types";
import { palette, radius, shadows } from "@shared/designSystem";
import { Text, VStack, HStack, StatusChip } from "@shared/ui";

export default function StaffListScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading, refetch, isRefetching } = useStaffList();
  const { data: stats } = useStaffStats();
  const staff = data?.data ?? [];

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

        <View style={{ paddingHorizontal: 20 }}>
          <HStack gap={12}>
            <Stat label="Active" value={String(stats?.activeStaff ?? "—")} />
            <Stat
              label="Present today"
              value={String(stats?.presentToday ?? "—")}
            />
            <Stat
              label="Paid (mo)"
              value={
                stats
                  ? `₹${(stats.salaryPaidThisMonth / 1000).toFixed(0)}k`
                  : "—"
              }
            />
          </HStack>
        </View>

        <FlatList
          data={staff}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={palette.ink[700]}
            />
          }
          ListEmptyComponent={
            <VStack align="center" gap={8} style={{ marginTop: 50 }}>
              <Users
                size={40}
                color={palette.text.disabled}
                strokeWidth={1.5}
              />
              <Text variant="body" tone="tertiary">
                {isLoading ? "Loading..." : "No staff yet."}
              </Text>
            </VStack>
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <StaffRow
              staff={item}
              onPress={() =>
                navigation.navigate("StaffProfile", { id: item.id })
              }
            />
          )}
        />

        <Pressable
          style={styles.fab}
          onPress={() => navigation.navigate("AddStaff")}
        >
          <Plus size={24} color={palette.text.inverse} strokeWidth={2.2} />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function StaffRow({ staff, onPress }: { staff: Staff; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <HStack gap={12} align="center">
        <View style={styles.avatar}>
          <Text variant="label-lg" tone="inverse">
            {staff.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <VStack gap={4} flex={1}>
          <Text variant="label-lg" tone="primary">
            {staff.name}
          </Text>
          <Text variant="caption" tone="tertiary">
            {staff.designation}
            {staff.phone ? ` · ${staff.phone}` : ""}
          </Text>
        </VStack>
        <VStack align="flex-end" gap={4}>
          <Text variant="label" tone="primary">
            ₹{staff.salaryAmount.toLocaleString("en-IN")}
          </Text>
          {staff.status === "inactive" ? (
            <StatusChip label="Inactive" tone="neutral" />
          ) : null}
        </VStack>
      </HStack>
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="h2" tone="primary">
        {value}
      </Text>
      <Text variant="caption" tone="tertiary">
        {label}
      </Text>
    </View>
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
  stat: {
    flex: 1,
    backgroundColor: palette.surface.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 14,
    marginTop: 8,
    ...shadows.xs,
  },
  card: {
    backgroundColor: palette.surface.primary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 14,
    ...shadows.xs,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    backgroundColor: palette.ink[700],
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: palette.ink[900],
    alignItems: "center",
    justifyContent: "center",
    ...shadows.lg,
  },
});
