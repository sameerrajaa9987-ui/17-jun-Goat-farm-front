import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ChevronLeft,
  Plus,
  Search,
  Boxes,
  TriangleAlert,
} from "lucide-react-native";
import {
  useInventoryItems,
  useInventoryStats,
} from "@modules/inventory/hooks/useInventory";
import {
  InventoryItem,
  CATEGORY_LABEL,
  InventoryCategory,
} from "@modules/inventory/types";
import { palette, radius, shadows } from "@shared/designSystem";
import { Text, VStack, HStack, StatusChip } from "@shared/ui";

const FILTERS: { key: "all" | InventoryCategory | "low"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "low", label: "Low stock" },
  { key: "feed", label: "Feed" },
  { key: "medicine", label: "Medicine" },
  { key: "equipment", label: "Equipment" },
  { key: "supplement", label: "Supplement" },
];

export default function InventoryListScreen() {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [search, setSearch] = useState("");

  const params: any = {};
  if (filter === "low") params.lowStockOnly = true;
  else if (filter !== "all") params.category = filter;
  if (search.trim()) params.search = search.trim();

  const { data, isLoading, refetch, isRefetching } = useInventoryItems(params);
  const { data: stats } = useInventoryStats();
  const items = data?.data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.topbar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <ChevronLeft size={26} color={palette.text.primary} />
          </Pressable>
          <Text variant="h3" tone="primary">
            Inventory
          </Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <HStack gap={12}>
            <Stat label="Items" value={String(stats?.items ?? "—")} />
            <Stat
              label="Low stock"
              value={String(stats?.lowStock ?? "—")}
              warn={!!stats?.lowStock}
            />
            <Stat
              label="Value"
              value={stats ? `₹${(stats.stockValue / 1000).toFixed(1)}k` : "—"}
            />
          </HStack>
        </View>

        <View style={styles.searchWrap}>
          <Search size={18} color={palette.text.tertiary} strokeWidth={1.8} />
          <TextInput
            placeholder="Search items"
            placeholderTextColor={palette.text.tertiary}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>

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
          data={items}
          keyExtractor={(i) => i.id}
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
            <VStack align="center" gap={8} style={{ marginTop: 50 }}>
              <Boxes
                size={40}
                color={palette.text.disabled}
                strokeWidth={1.5}
              />
              <Text variant="body" tone="tertiary">
                {isLoading ? "Loading..." : "No items."}
              </Text>
            </VStack>
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <ItemRow
              item={item}
              onPress={() =>
                navigation.navigate("InventoryItem", { id: item.id })
              }
            />
          )}
        />

        <Pressable
          style={styles.fab}
          onPress={() => navigation.navigate("AddInventoryItem")}
        >
          <Plus size={24} color={palette.text.inverse} strokeWidth={2.2} />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function ItemRow({
  item,
  onPress,
}: {
  item: InventoryItem;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <HStack gap={12} align="center">
        <VStack gap={5} flex={1}>
          <HStack gap={8} align="center">
            <Text variant="label-lg" tone="primary">
              {item.name}
            </Text>
            {item.isLow ? <StatusChip label="Low" tone="danger" /> : null}
          </HStack>
          <Text variant="caption" tone="tertiary">
            {CATEGORY_LABEL[item.category]}
            {item.supplier ? ` · ${item.supplier}` : ""}
          </Text>
        </VStack>
        <VStack align="flex-end" gap={2}>
          <Text variant="h3" tone="primary">
            {item.currentStock}
          </Text>
          <Text variant="caption" tone="tertiary">
            {item.unit}
          </Text>
        </VStack>
      </HStack>
    </Pressable>
  );
}

function Stat({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <View style={styles.stat}>
      <HStack gap={4} align="center">
        {warn ? <TriangleAlert size={14} color={palette.danger.text} /> : null}
        <Text variant="h2" tone="primary">
          {value}
        </Text>
      </HStack>
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
    ...shadows.xs,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
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
    padding: 16,
    ...shadows.xs,
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
