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
import { ChevronLeft, Plus, Tag } from "lucide-react-native";
import { format } from "date-fns";
import { useSales, useSalesStats } from "@modules/sales/hooks/useSales";
import { Sale } from "@modules/sales/types";
import { palette, radius, shadows } from "@shared/designSystem";
import { Text, VStack, HStack, StatusChip } from "@shared/ui";

export default function SalesScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading, refetch, isRefetching } = useSales();
  const { data: stats } = useSalesStats();
  const sales = data?.data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.topbar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <ChevronLeft size={26} color={palette.text.primary} />
          </Pressable>
          <Text variant="h3" tone="primary">
            Sales
          </Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <HStack gap={12}>
            <Stat label="Sales" value={String(stats?.count ?? "—")} />
            <Stat
              label="Revenue"
              value={stats ? `₹${(stats.revenue / 1000).toFixed(1)}k` : "—"}
            />
            <Stat
              label="Profit"
              value={stats ? `₹${(stats.profit / 1000).toFixed(1)}k` : "—"}
            />
          </HStack>
        </View>

        <FlatList
          data={sales}
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
              <Tag size={40} color={palette.text.disabled} strokeWidth={1.5} />
              <Text variant="body" tone="tertiary">
                {isLoading ? "Loading..." : "No sales yet."}
              </Text>
            </VStack>
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => <SaleRow sale={item} />}
        />

        <Pressable
          style={styles.fab}
          onPress={() => navigation.navigate("SellGoat")}
        >
          <Plus size={24} color={palette.text.inverse} strokeWidth={2.2} />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function SaleRow({ sale }: { sale: Sale }) {
  let when = sale.saleDate;
  try {
    when = format(new Date(sale.saleDate), "dd MMM yyyy");
  } catch {
    /* raw */
  }
  return (
    <View style={styles.card}>
      <HStack gap={12} align="center">
        <VStack gap={5} flex={1}>
          <HStack gap={8} align="center">
            <Text variant="label-lg" tone="primary">
              {sale.goatName || sale.goatCode}
            </Text>
            <Text variant="caption" tone="tertiary">
              {sale.invoiceNo}
            </Text>
          </HStack>
          <Text variant="caption" tone="tertiary">
            {sale.buyerName || "Buyer"} · {when}
          </Text>
          {sale.wasClientOwned ? (
            <StatusChip label="Ad Pali handover" tone="info" />
          ) : (
            <StatusChip
              label={`Profit ₹${sale.profit.toLocaleString("en-IN")}`}
              tone={sale.profit >= 0 ? "success" : "danger"}
            />
          )}
        </VStack>
        <Text variant="h3" tone="primary">
          ₹{sale.salePrice.toLocaleString("en-IN")}
        </Text>
      </HStack>
    </View>
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
    ...shadows.xs,
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
