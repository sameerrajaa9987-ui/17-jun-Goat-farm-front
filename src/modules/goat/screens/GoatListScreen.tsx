import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  Plus,
  Search,
  QrCode,
  PawPrint,
  ChevronRight,
} from "lucide-react-native";
import { useGoats } from "@modules/goat/hooks/useGoats";
import { GoatListItem } from "@modules/goat/types";
import { useAuthStore } from "@shared/store/useAuthStore";
import { environment } from "@config/env";
import {
  palette,
  radius,
  shadows,
  gradients,
  elevation,
} from "@shared/designSystem";
import { Text, VStack, HStack, StatusChip, Card } from "@shared/ui";

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
          <VStack gap={3} flex={1}>
            <Text variant="overline" tone="tertiary">
              Herd
            </Text>
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
            hitSlop={8}
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterBar}
          contentContainerStyle={styles.filters}
        >
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
        </ScrollView>

        <FlatList
          data={goats}
          keyExtractor={(g) => g.id}
          contentContainerStyle={{
            padding: 16,
            paddingTop: 12,
            paddingBottom: 110,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={palette.ink[700]}
            />
          }
          ListEmptyComponent={
            <VStack align="center" gap={10} style={{ marginTop: 70 }}>
              <View style={styles.emptyIcon}>
                <PawPrint
                  size={34}
                  color={palette.ink[300]}
                  strokeWidth={1.5}
                />
              </View>
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
            style={styles.fabWrap}
            onPress={() => navigation.navigate("RegisterGoat")}
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
    <Card
      onPress={onPress}
      elevation="raised"
      padded={false}
      style={styles.card}
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
        <ChevronRight size={18} color={palette.text.tertiary} strokeWidth={2} />
      </HStack>
    </Card>
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
    width: 46,
    height: 46,
    borderRadius: radius.full,
    backgroundColor: palette.surface.primary,
    borderWidth: 1,
    borderColor: palette.border.default,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.xs,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
    ...shadows.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: palette.text.primary,
    paddingVertical: 0,
  },
  filterBar: { flexGrow: 0 },
  filters: {
    gap: 8,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 2,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  chipActive: {
    backgroundColor: palette.ink[900],
    borderColor: palette.ink[900],
  },
  card: { padding: 14 },
  photo: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    backgroundColor: palette.ink[50],
  },
  photoPlaceholder: { alignItems: "center", justifyContent: "center" },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: palette.ink[50],
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
