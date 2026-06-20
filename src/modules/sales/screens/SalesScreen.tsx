import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Plus, Tag } from "lucide-react-native";
import { format } from "date-fns";
import {
  useSales,
  useSalesStats,
  useVoidSale,
} from "@modules/sales/hooks/useSales";
import { Sale } from "@modules/sales/types";
import { useAuthStore } from "@shared/store/useAuthStore";
import {
  palette,
  radius,
  shadows,
  gradients,
  elevation,
} from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  StatusChip,
  Card,
  StatTile,
  Button,
} from "@shared/ui";

export default function SalesScreen() {
  const navigation = useNavigation<any>();
  const canVoid = useAuthStore((s) => s.hasPermission)("manage_sales");
  const { data, isLoading, refetch, isRefetching } = useSales();
  const { data: stats } = useSalesStats();
  const voidSale = useVoidSale();
  const sales = data?.data ?? [];

  const onVoid = (sale: Sale) => {
    Alert.alert(
      "Void sale",
      `Void the sale of ${sale.goatName || sale.goatCode}? This reverses the recorded income and returns the goat to active.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Void sale",
          style: "destructive",
          onPress: () =>
            voidSale.mutate(sale.id, {
              onError: (e: any) =>
                Alert.alert(
                  "Could not void",
                  e?.response?.data?.error?.message || "Try again.",
                ),
            }),
        },
      ],
    );
  };

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
              Trade
            </Text>
            <Text variant="h1" tone="primary">
              Sales
            </Text>
            <Text variant="body-sm" tone="tertiary">
              {stats ? `${stats.count} sales recorded` : "Goat sales ledger"}
            </Text>
          </VStack>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <HStack gap={12}>
            <StatTile label="Sales" value={String(stats?.count ?? "—")} />
            <StatTile
              label="Revenue"
              value={stats ? `₹${(stats.revenue / 1000).toFixed(1)}k` : "—"}
              tone="light"
            />
            <StatTile
              label="Profit"
              value={stats ? `₹${(stats.profit / 1000).toFixed(1)}k` : "—"}
              tone="light"
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
            <VStack align="center" gap={10} style={{ marginTop: 60 }}>
              <View style={styles.emptyIcon}>
                <Tag size={34} color={palette.ink[300]} strokeWidth={1.5} />
              </View>
              <Text variant="body" tone="tertiary">
                {isLoading ? "Loading..." : "No sales yet."}
              </Text>
            </VStack>
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <SaleRow
              sale={item}
              canVoid={canVoid}
              onVoid={() => onVoid(item)}
              voiding={voidSale.isPending}
            />
          )}
        />

        <Pressable
          style={styles.fabWrap}
          onPress={() => navigation.navigate("SellGoat")}
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

function SaleRow({
  sale,
  canVoid,
  onVoid,
  voiding,
}: {
  sale: Sale;
  canVoid: boolean;
  onVoid: () => void;
  voiding: boolean;
}) {
  let when = sale.saleDate;
  try {
    when = format(new Date(sale.saleDate), "dd MMM yyyy");
  } catch {
    /* raw */
  }
  return (
    <Card elevation="raised" style={styles.card}>
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
      {canVoid ? (
        <Button
          label="Void sale"
          variant="destructive"
          size="sm"
          fullWidth={false}
          onPress={onVoid}
          loading={voiding}
          style={styles.voidBtn}
        />
      ) : null}
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
  card: { padding: 16 },
  voidBtn: { marginTop: 12, alignSelf: "flex-start" },
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
