import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Plus, Search, QrCode, PawPrint } from "lucide-react-native";
import { useGoats } from "@modules/goat/hooks/useGoats";
import { GoatListItem } from "@modules/goat/types";
import { useAuthStore } from "@shared/store/useAuthStore";
import { environment } from "@config/env";
import { palette, radius, shadows } from "@shared/designSystem";
import { Text, VStack, HStack, StatusChip } from "@shared/ui";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "farm", label: "Farm" },
  { key: "client", label: "Ad Pali" },
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
] as const;

const HEALTH_TONE: Record<string, "success" | "warning" | "danger" | "info"> = {
  healthy: "success",
  under_treatment: "warning",
  critical: "danger",
  recovered: "info",
};

export function mediaUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${environment.socketUrl}${path}`;
}

export default function GoatListScreen() {
  const navigation = useNavigation<any>();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canManage = hasPermission("manage_goats");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [search, setSearch] = useState("");

  const params: any = {};
  if (filter === "farm" || filter === "client") params.ownershipType = filter;
  if (filter === "male" || filter === "female") params.gender = filter;
  if (search.trim()) params.search = search.trim();

  const { data, isLoading, refetch, isRefetching } = useGoats(params);
  const goats = data?.data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <VStack gap={2} flex={1}>
            <Text variant="h1" tone="primary">
              Goats
            </Text>
            <Text variant="body-sm" tone="tertiary">
              {data?.meta?.total ?? 0} registered
            </Text>
          </VStack>
          <Pressable
            style={styles.scanBtn}
            onPress={() => navigation.navigate("ScanGoat")}
          >
            <QrCode size={20} color={palette.ink[800]} strokeWidth={1.8} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Search size={18} color={palette.text.tertiary} strokeWidth={1.8} />
          <TextInput
            placeholder="Search by ID, name, tag, breed"
            placeholderTextColor={palette.text.tertiary}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text
                  variant="label"
                  style={{
                    color: active
                      ? palette.text.inverse
                      : palette.text.secondary,
                  }}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          data={goats}
          keyExtractor={(g) => g.id}
          contentContainerStyle={{
            padding: 20,
            paddingTop: 8,
            paddingBottom: 100,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={palette.ink[700]}
            />
          }
          ListEmptyComponent={
            <VStack align="center" gap={8} style={{ marginTop: 60 }}>
              <PawPrint
                size={40}
                color={palette.text.disabled}
                strokeWidth={1.5}
              />
              <Text variant="body" tone="tertiary">
                {isLoading ? "Loading..." : "No goats yet."}
              </Text>
            </VStack>
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <GoatCard
              goat={item}
              onPress={() =>
                navigation.navigate("GoatProfile", { id: item.id })
              }
            />
          )}
        />

        {canManage && (
          <Pressable
            style={styles.fab}
            onPress={() => navigation.navigate("RegisterGoat")}
          >
            <Plus size={24} color={palette.text.inverse} strokeWidth={2.2} />
          </Pressable>
        )}
      </SafeAreaView>
    </View>
  );
}

function GoatCard({
  goat,
  onPress,
}: {
  goat: GoatListItem;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <HStack gap={12} align="center">
        {goat.photo ? (
          <Image source={{ uri: mediaUrl(goat.photo) }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <PawPrint size={22} color={palette.ink[400]} strokeWidth={1.8} />
          </View>
        )}
        <VStack gap={5} flex={1}>
          <HStack gap={8} align="center">
            <Text variant="label-lg" tone="primary">
              {goat.name || goat.goatId}
            </Text>
            <Text variant="caption" tone="tertiary">
              {goat.goatId}
            </Text>
          </HStack>
          <Text variant="body-sm" tone="secondary">
            {[
              goat.breed || "—",
              goat.gender === "male" ? "♂" : "♀",
              goat.latestWeight ? `${goat.latestWeight} kg` : null,
            ]
              .filter(Boolean)
              .join("  ·  ")}
          </Text>
          <HStack gap={6}>
            <StatusChip
              label={goat.ownership.type === "client" ? "Ad Pali" : "Farm"}
              tone={goat.ownership.type === "client" ? "info" : "neutral"}
            />
            <StatusChip
              label={goat.healthStatus.replace("_", " ")}
              tone={HEALTH_TONE[goat.healthStatus]}
            />
            {goat.status !== "active" ? (
              <StatusChip label={goat.status} tone="warning" />
            ) : null}
          </HStack>
        </VStack>
      </HStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  scanBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: palette.surface.primary,
    borderWidth: 1,
    borderColor: palette.border.default,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: palette.text.primary,
    paddingVertical: 0,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  chipActive: {
    backgroundColor: palette.ink[900],
    borderColor: palette.ink[900],
  },
  card: {
    backgroundColor: palette.surface.primary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 14,
    ...shadows.xs,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: palette.ink[50],
  },
  photoPlaceholder: { alignItems: "center", justifyContent: "center" },
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
