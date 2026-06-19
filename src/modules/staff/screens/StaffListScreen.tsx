import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Plus, Users, ChevronRight } from "lucide-react-native";
import { useStaffList, useStaffStats } from "@modules/staff/hooks/useStaff";
import { Staff } from "@modules/staff/types";
import {
  palette,
  radius,
  shadows,
  gradients,
  elevation,
} from "@shared/designSystem";
import { Text, VStack, HStack, StatusChip, Card, StatTile } from "@shared/ui";

export default function StaffListScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading, refetch, isRefetching } = useStaffList();
  const { data: stats } = useStaffStats();
  const staff = data?.data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={styles.backBtn}
          >
            <ChevronLeft
              size={22}
              color={palette.text.primary}
              strokeWidth={2}
            />
          </Pressable>
          <VStack gap={3} flex={1}>
            <Text variant="overline" tone="tertiary">
              People
            </Text>
            <Text variant="h1" tone="primary">
              Staff
            </Text>
            <Text variant="body-sm" tone="tertiary">
              {data?.meta?.total ?? 0} on the team
            </Text>
          </VStack>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <HStack gap={12}>
            <StatTile
              label="Active"
              value={String(stats?.activeStaff ?? "—")}
            />
            <StatTile
              label="Present today"
              value={String(stats?.presentToday ?? "—")}
              tone="light"
            />
            <StatTile
              label="Paid (mo)"
              value={
                stats
                  ? `₹${(stats.salaryPaidThisMonth / 1000).toFixed(0)}k`
                  : "—"
              }
              tone="light"
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
            <VStack align="center" gap={10} style={{ marginTop: 60 }}>
              <View style={styles.emptyIcon}>
                <Users size={34} color={palette.ink[300]} strokeWidth={1.5} />
              </View>
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
          style={styles.fabWrap}
          onPress={() => navigation.navigate("AddStaff")}
        >
          <LinearGradient
            colors={gradients.clay}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Plus size={24} color={palette.text.inverse} strokeWidth={2.4} />
          </LinearGradient>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function StaffRow({ staff, onPress }: { staff: Staff; onPress: () => void }) {
  return (
    <Card
      onPress={onPress}
      elevation="raised"
      padded={false}
      style={styles.card}
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
        <ChevronRight size={18} color={palette.text.tertiary} strokeWidth={2} />
      </HStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: palette.surface.primary,
    borderWidth: 1,
    borderColor: palette.border.default,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.xs,
  },
  card: { padding: 14 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: palette.ink[50],
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    backgroundColor: palette.ink[700],
    alignItems: "center",
    justifyContent: "center",
  },
  fabWrap: {
    position: "absolute",
    right: 20,
    bottom: 28,
    borderRadius: radius.full,
    ...elevation.floating,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
