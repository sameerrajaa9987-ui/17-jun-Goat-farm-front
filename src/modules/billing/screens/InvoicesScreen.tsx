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
  Wallet,
  TrendingUp,
  AlarmClock,
} from "lucide-react-native";
import { format } from "date-fns";
import {
  useInvoices,
  useBillingStats,
  useGenerateInvoices,
} from "@modules/billing/hooks/useBilling";
import { Invoice, InvoiceStatus, INVOICE_TONE } from "@modules/billing/types";
import { palette, radius, shadows } from "@shared/designSystem";
import { Text, VStack, HStack, StatusChip, Card, StatTile } from "@shared/ui";

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
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            style={styles.backBtn}
          >
            <ChevronLeft size={24} color={palette.text.primary} />
          </Pressable>
          <VStack gap={2} flex={1} style={{ marginLeft: 12 }}>
            <Text variant="overline" tone="tertiary">
              Ad Pali billing
            </Text>
            <Text variant="h1" tone="primary">
              Invoices
            </Text>
          </VStack>
          <Pressable
            onPress={() => navigation.navigate("Packages")}
            hitSlop={10}
            style={styles.iconBtn}
          >
            <PackageIcon size={20} color={palette.ink[800]} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <HStack gap={12}>
            <StatTile
              label="Outstanding"
              value={stats ? `₹${(stats.outstanding / 1000).toFixed(1)}k` : "—"}
              icon={Wallet}
              tone={stats?.outstanding ? "clay" : "light"}
            />
            <StatTile
              label="Collected (mo)"
              value={
                stats
                  ? `₹${(stats.collectedThisMonth / 1000).toFixed(1)}k`
                  : "—"
              }
              icon={TrendingUp}
            />
            <StatTile
              label="Overdue"
              value={String(stats?.overdueCount ?? "—")}
              icon={AlarmClock}
              tone={stats?.overdueCount ? "forest" : "light"}
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
    <Card onPress={onPress} elevation="raised">
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
  topbar: {
    flexDirection: "row",
    alignItems: "center",
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
  iconBtn: {
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
});
