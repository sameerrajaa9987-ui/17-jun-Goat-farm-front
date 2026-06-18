import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  ChevronLeft,
  Plus,
  Search,
  Boxes,
  ChevronRight,
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
import {
  palette,
  radius,
  shadows,
  gradients,
  elevation,
} from "@shared/designSystem";
import { Text, VStack, HStack, StatusChip, Card, StatTile } from "@shared/ui";

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
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={8}
          >
            <ChevronLeft
              size={22}
              color={palette.text.primary}
              strokeWidth={2}
            />
          </Pressable>
          <VStack gap={3} flex={1}>
            <Text variant="overline" tone="tertiary">
              Stores
            </Text>
            <Text variant="h1" tone="primary">
              Inventory
            </Text>
            <Text variant="body-sm" tone="tertiary">
              {stats ? `${stats.items} items tracked` : "Stock on hand"}
            </Text>
          </VStack>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <HStack gap={12}>
            <StatTile label="Items" value={String(stats?.items ?? "—")} />
            <StatTile
              label="Low stock"
              value={String(stats?.lowStock ?? "—")}
              tone={stats?.lowStock ? "clay" : "light"}
            />
            <StatTile
              label="Value"
              value={stats ? `₹${(stats.stockValue / 1000).toFixed(1)}k` : "—"}
              tone="forest"
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
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
            <VStack align="center" gap={10} style={{ marginTop: 60 }}>
              <View style={styles.emptyIcon}>
                <Boxes size={34} color={palette.ink[300]} strokeWidth={1.5} />
              </View>
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
          style={styles.fabWrap}
          onPress={() => navigation.navigate("AddInventoryItem")}
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

function ItemRow({
  item,
  onPress,
}: {
  item: InventoryItem;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress} elevation="raised" style={styles.card}>
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
    paddingBottom: 12,
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
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
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
  filters: {
    gap: 8,
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
  card: { padding: 16 },
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
