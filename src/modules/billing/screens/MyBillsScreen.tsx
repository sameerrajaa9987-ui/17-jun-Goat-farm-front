import React from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ReceiptIndianRupee, ChevronRight } from "lucide-react-native";
import { format } from "date-fns";
import {
  useInvoices,
  useBillingStats,
} from "@modules/billing/hooks/useBilling";
import { Invoice, INVOICE_TONE } from "@modules/billing/types";
import { palette, radius } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  StatusChip,
  Card,
  GradientHero,
} from "@shared/ui";

export default function MyBillsScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading, refetch, isRefetching } = useInvoices();
  const { data: stats } = useBillingStats();
  const invoices = data?.data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <VStack gap={2}>
            <Text variant="overline" tone="tertiary">
              Ad Pali
            </Text>
            <Text variant="h1" tone="primary">
              My bills
            </Text>
            <Text variant="body-sm" tone="tertiary">
              Monthly invoices
            </Text>
          </VStack>
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 4 }}>
          <GradientHero variant={stats?.outstanding ? "clay" : "hero"}>
            <Text
              variant="overline"
              style={{ color: "rgba(255,255,255,0.66)" }}
            >
              Outstanding
            </Text>
            <Text variant="display-md" tone="inverse" style={{ marginTop: 4 }}>
              {stats ? `₹${stats.outstanding.toLocaleString("en-IN")}` : "—"}
            </Text>
            <View style={styles.heroDivider} />
            <HStack justify="space-between" align="center">
              <Text
                variant="body-sm"
                style={{ color: "rgba(255,255,255,0.74)" }}
              >
                Paid total
              </Text>
              <Text variant="label-lg" tone="inverse">
                {stats ? `₹${stats.collected.toLocaleString("en-IN")}` : "—"}
              </Text>
            </HStack>
          </GradientHero>
        </View>

        <FlatList
          data={invoices}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
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
                <ReceiptIndianRupee
                  size={32}
                  color={palette.ink[300]}
                  strokeWidth={1.5}
                />
              </View>
              <Text variant="body" tone="tertiary">
                {isLoading ? "Loading..." : "No bills yet."}
              </Text>
            </VStack>
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <InvoiceRow
              invoice={item}
              onPress={() =>
                navigation.navigate("InvoiceDetail", { id: item.id })
              }
            />
          )}
        />
      </SafeAreaView>
    </View>
  );
}

function InvoiceRow({
  invoice,
  onPress,
}: {
  invoice: Invoice;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress} elevation="raised">
      <HStack gap={12} align="center">
        <VStack gap={5} flex={1}>
          <HStack gap={8} align="center">
            <Text variant="label-lg" tone="primary">
              {invoice.invoiceNo}
            </Text>
            <StatusChip
              label={invoice.status}
              tone={INVOICE_TONE[invoice.status]}
            />
          </HStack>
          <Text variant="caption" tone="tertiary">
            {invoice.period} · {invoice.lineItems.length} goat
            {invoice.lineItems.length === 1 ? "" : "s"} · due{" "}
            {fmt(invoice.dueDate)}
          </Text>
        </VStack>
        <Text variant="h3" tone="primary">
          ₹{invoice.total.toLocaleString("en-IN")}
        </Text>
        <ChevronRight size={18} color={palette.text.tertiary} />
      </HStack>
    </Card>
  );
}

function fmt(d: string) {
  try {
    return format(new Date(d), "dd MMM");
  } catch {
    return d;
  }
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.16)",
    marginVertical: 16,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: palette.ink[50],
    alignItems: "center",
    justifyContent: "center",
  },
});
