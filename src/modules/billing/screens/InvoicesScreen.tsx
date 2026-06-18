import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ChevronLeft,
  RefreshCcw,
  ChevronRight,
  Package as PackageIcon,
} from "lucide-react-native";
import { format } from "date-fns";
import {
  useInvoices,
  useBillingStats,
  useGenerateInvoices,
} from "@modules/billing/hooks/useBilling";
import { Invoice, InvoiceStatus, INVOICE_TONE } from "@modules/billing/types";
import { palette, radius, shadows } from "@shared/designSystem";
import { Text, VStack, HStack, StatusChip } from "@shared/ui";

const FILTERS: { key: "all" | InvoiceStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "due", label: "Due" },
  { key: "overdue", label: "Overdue" },
  { key: "paid", label: "Paid" },
];

export default function InvoicesScreen() {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<"all" | InvoiceStatus>("all");
  const params = filter === "all" ? undefined : { status: filter };
  const { data, isLoading, refetch, isRefetching } = useInvoices(params);
  const { data: stats } = useBillingStats();
  const generate = useGenerateInvoices();
  const invoices = data?.data ?? [];

  const onGenerate = () => {
    generate.mutate(undefined, {
      onSuccess: (r) =>
        Alert.alert(
          "Invoices generated",
          `Created ${r.created}, skipped ${r.skipped} for ${r.period}.`,
        ),
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.topbar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <ChevronLeft size={26} color={palette.text.primary} />
          </Pressable>
          <Text variant="h3" tone="primary">
            Invoices
          </Text>
          <Pressable
            onPress={() => navigation.navigate("Packages")}
            hitSlop={10}
          >
            <PackageIcon size={22} color={palette.ink[800]} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <HStack gap={12}>
            <Stat
              label="Outstanding"
              value={stats ? `₹${(stats.outstanding / 1000).toFixed(1)}k` : "—"}
              warn={!!stats?.outstanding}
            />
            <Stat
              label="Collected (mo)"
              value={
                stats
                  ? `₹${(stats.collectedThisMonth / 1000).toFixed(1)}k`
                  : "—"
              }
            />
            <Stat
              label="Overdue"
              value={String(stats?.overdueCount ?? "—")}
              warn={!!stats?.overdueCount}
            />
          </HStack>
        </View>

        <Pressable
          style={styles.generateBtn}
          onPress={onGenerate}
          disabled={generate.isPending}
        >
          <RefreshCcw size={16} color={palette.text.inverse} strokeWidth={2} />
          <Text variant="label" tone="inverse">
            {generate.isPending
              ? "Generating..."
              : "Generate this month's invoices"}
          </Text>
        </Pressable>

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
          data={invoices}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{
            padding: 20,
            paddingTop: 8,
            paddingBottom: 40,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={palette.ink[700]}
            />
          }
          ListEmptyComponent={
            <Text
              variant="body"
              tone="tertiary"
              align="center"
              style={{ marginTop: 40 }}
            >
              {isLoading
                ? "Loading..."
                : "No invoices. Generate to begin billing."}
            </Text>
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <Row
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

function Row({ invoice, onPress }: { invoice: Invoice; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <HStack gap={12} align="center">
        <VStack gap={5} flex={1}>
          <HStack gap={8} align="center">
            <Text variant="label-lg" tone="primary">
              {invoice.client?.name || invoice.invoiceNo}
            </Text>
            <StatusChip
              label={invoice.status}
              tone={INVOICE_TONE[invoice.status]}
            />
          </HStack>
          <Text variant="caption" tone="tertiary">
            {invoice.invoiceNo} · {invoice.period} · due {fmt(invoice.dueDate)}
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
    <View style={[styles.stat, warn && { borderColor: palette.danger.border }]}>
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
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 13,
    borderRadius: radius.full,
    backgroundColor: palette.amber[600],
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 14,
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
});
