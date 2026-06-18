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
import { ReceiptIndianRupee, ChevronRight } from "lucide-react-native";
import { format } from "date-fns";
import {
  useInvoices,
  useBillingStats,
} from "@modules/billing/hooks/useBilling";
import { Invoice, INVOICE_TONE } from "@modules/billing/types";
import { palette, radius, shadows } from "@shared/designSystem";
import { Text, VStack, HStack, StatusChip } from "@shared/ui";

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
            <Text variant="h1" tone="primary">
              My bills
            </Text>
            <Text variant="body-sm" tone="tertiary">
              Ad Pali monthly invoices
            </Text>
          </VStack>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <HStack gap={12}>
            <Stat
              label="Outstanding"
              value={
                stats ? `₹${stats.outstanding.toLocaleString("en-IN")}` : "—"
              }
              warn={!!stats?.outstanding}
            />
            <Stat
              label="Paid total"
              value={
                stats ? `₹${stats.collected.toLocaleString("en-IN")}` : "—"
              }
            />
          </HStack>
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
            <VStack align="center" gap={8} style={{ marginTop: 50 }}>
              <ReceiptIndianRupee
                size={40}
                color={palette.text.disabled}
                strokeWidth={1.5}
              />
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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
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
    </Pressable>
  );
}

function fmt(d: string) {
  try {
    return format(new Date(d), "dd MMM");
  } catch {
    return d;
  }
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
    <View
      style={[
        styles.stat,
        warn && {
          borderColor: palette.danger.border,
          backgroundColor: palette.danger.bg,
        },
      ]}
    >
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
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  stat: {
    flex: 1,
    backgroundColor: palette.surface.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 16,
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
});
