import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ChevronLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  X,
  ArrowLeftRight,
} from "lucide-react-native";
import { format } from "date-fns";
import {
  useTransactions,
  usePnl,
  useCreateTransaction,
} from "@modules/finance/hooks/useFinance";
import {
  Transaction,
  TxType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  CATEGORY_LABEL,
} from "@modules/finance/types";
import { palette, radius, shadows } from "@shared/designSystem";
import { Text, VStack, HStack, Button, TextField } from "@shared/ui";

const FILTERS: { key: "all" | TxType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "income", label: "Income" },
  { key: "expense", label: "Expense" },
];

export default function FinanceScreen() {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<"all" | TxType>("all");
  const [adding, setAdding] = useState(false);
  const params = filter === "all" ? undefined : { type: filter };
  const { data, isLoading, refetch, isRefetching } = useTransactions(params);
  const { data: pnl } = usePnl();
  const txs = data?.data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.topbar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <ChevronLeft size={26} color={palette.text.primary} />
          </Pressable>
          <Text variant="h3" tone="primary">
            Finance
          </Text>
          <Pressable onPress={() => navigation.navigate("Sales")} hitSlop={10}>
            <ArrowLeftRight size={22} color={palette.ink[800]} />
          </Pressable>
        </View>

        {/* P&L */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={styles.pnlCard}>
            <HStack justify="space-between" align="center">
              <Text variant="overline" tone="tertiary">
                Net (all time)
              </Text>
            </HStack>
            <Text
              variant="display-sm"
              style={{
                color:
                  (pnl?.net ?? 0) >= 0
                    ? palette.success.text
                    : palette.danger.text,
                marginTop: 4,
              }}
            >
              ₹{(pnl?.net ?? 0).toLocaleString("en-IN")}
            </Text>
            <HStack gap={16} style={{ marginTop: 12 }}>
              <HStack gap={6} align="center">
                <TrendingUp size={16} color={palette.success.text} />
                <Text variant="body-sm" tone="secondary">
                  ₹{(pnl?.income ?? 0).toLocaleString("en-IN")} in
                </Text>
              </HStack>
              <HStack gap={6} align="center">
                <TrendingDown size={16} color={palette.danger.text} />
                <Text variant="body-sm" tone="secondary">
                  ₹{(pnl?.expense ?? 0).toLocaleString("en-IN")} out
                </Text>
              </HStack>
            </HStack>
          </View>
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
          data={txs}
          keyExtractor={(t) => t.id}
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
            <Text
              variant="body"
              tone="tertiary"
              align="center"
              style={{ marginTop: 40 }}
            >
              {isLoading ? "Loading..." : "No transactions yet."}
            </Text>
          }
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => <TxRow tx={item} />}
        />

        <Pressable style={styles.fab} onPress={() => setAdding(true)}>
          <Plus size={24} color={palette.text.inverse} strokeWidth={2.2} />
        </Pressable>
      </SafeAreaView>

      <AddTxModal visible={adding} onClose={() => setAdding(false)} />
    </View>
  );
}

function TxRow({ tx }: { tx: Transaction }) {
  const income = tx.type === "income";
  let when = tx.date;
  try {
    when = format(new Date(tx.date), "dd MMM");
  } catch {
    /* raw */
  }
  return (
    <View style={styles.txRow}>
      <View
        style={[
          styles.txIcon,
          { backgroundColor: income ? palette.success.bg : palette.danger.bg },
        ]}
      >
        {income ? (
          <TrendingUp size={18} color={palette.success.text} />
        ) : (
          <TrendingDown size={18} color={palette.danger.text} />
        )}
      </View>
      <VStack gap={2} flex={1}>
        <Text variant="label-lg" tone="primary">
          {CATEGORY_LABEL[tx.category] || tx.category}
        </Text>
        <Text variant="caption" tone="tertiary" numberOfLines={1}>
          {when}
          {tx.description ? ` · ${tx.description}` : ""}
          {tx.source !== "manual" ? ` · auto` : ""}
        </Text>
      </VStack>
      <Text
        variant="label-lg"
        style={{ color: income ? palette.success.text : palette.danger.text }}
      >
        {income ? "+" : "−"}₹{tx.amount.toLocaleString("en-IN")}
      </Text>
    </View>
  );
}

function AddTxModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const create = useCreateTransaction();
  const [type, setType] = useState<TxType>("expense");
  const [category, setCategory] = useState<string>("feed");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const setTypeAndCat = (t: TxType) => {
    setType(t);
    setCategory(t === "income" ? "milk" : "feed");
  };

  const submit = () => {
    const a = Number(amount);
    if (!a) return;
    create.mutate(
      {
        type,
        category,
        amount: a,
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          setAmount("");
          setDescription("");
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.sheetBackdrop}
      >
        <View style={styles.sheet}>
          <HStack justify="space-between" align="center">
            <Text variant="h3" tone="primary">
              Add transaction
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={22} color={palette.text.tertiary} />
            </Pressable>
          </HStack>

          <HStack gap={10} style={{ marginTop: 16 }}>
            <Pressable
              onPress={() => setTypeAndCat("expense")}
              style={[
                styles.typeBtn,
                type === "expense" && {
                  backgroundColor: palette.danger.bg,
                  borderColor: palette.danger.border,
                },
              ]}
            >
              <Text
                variant="label-lg"
                style={{
                  color:
                    type === "expense"
                      ? palette.danger.text
                      : palette.text.secondary,
                }}
              >
                Expense
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setTypeAndCat("income")}
              style={[
                styles.typeBtn,
                type === "income" && {
                  backgroundColor: palette.success.bg,
                  borderColor: palette.success.border,
                },
              ]}
            >
              <Text
                variant="label-lg"
                style={{
                  color:
                    type === "income"
                      ? palette.success.text
                      : palette.text.secondary,
                }}
              >
                Income
              </Text>
            </Pressable>
          </HStack>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 14 }}
            contentContainerStyle={{ gap: 8 }}
          >
            {categories.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.catChip, category === c && styles.catChipActive]}
              >
                <Text
                  variant="label"
                  style={{
                    color:
                      category === c
                        ? palette.text.inverse
                        : palette.text.secondary,
                  }}
                >
                  {CATEGORY_LABEL[c]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <VStack gap={14} style={{ marginTop: 16 }}>
            <TextField
              label="Amount (₹)"
              placeholder="0"
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <TextField
              label="Description (optional)"
              placeholder="Notes"
              value={description}
              onChangeText={setDescription}
            />
            <Button
              label="Save"
              size="lg"
              loading={create.isPending}
              onPress={submit}
            />
          </VStack>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
  pnlCard: {
    backgroundColor: palette.surface.primary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 18,
    ...shadows.sm,
  },
  filters: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  chip: {
    paddingHorizontal: 16,
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
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: palette.surface.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 14,
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
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
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10,30,16,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: palette.surface.primary,
    borderTopLeftRadius: radius["2xl"],
    borderTopRightRadius: radius["2xl"],
    padding: 24,
    paddingBottom: 40,
  },
  typeBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 13,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  catChipActive: {
    backgroundColor: palette.ink[900],
    borderColor: palette.ink[900],
  },
});
