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
import { LinearGradient } from "expo-linear-gradient";
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
import {
  palette,
  radius,
  shadows,
  gradients,
  elevation,
  layout,
} from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  Button,
  TextField,
  Card,
  GradientHero,
  StatTile,
} from "@shared/ui";

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
              Books
            </Text>
            <Text variant="h1" tone="primary">
              Finance
            </Text>
            <Text variant="body-sm" tone="tertiary">
              Income, expense & profit
            </Text>
          </VStack>
          <Pressable
            style={styles.backBtn}
            onPress={() => navigation.navigate("Sales")}
            hitSlop={8}
          >
            <ArrowLeftRight
              size={20}
              color={palette.ink[800]}
              strokeWidth={2}
            />
          </Pressable>
        </View>

        <FlatList
          data={txs}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{
            padding: 20,
            paddingTop: 4,
            paddingBottom: 100,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={palette.ink[700]}
            />
          }
          ListHeaderComponent={
            <VStack gap={16} style={{ marginBottom: 16 }}>
              {/* Headline balance */}
              <GradientHero>
                <Text
                  variant="overline"
                  style={{ color: "rgba(255,255,255,0.66)" }}
                >
                  Net balance (all time)
                </Text>
                <Text
                  variant="display-md"
                  tone="inverse"
                  style={{ marginTop: 8 }}
                >
                  ₹{(pnl?.net ?? 0).toLocaleString("en-IN")}
                </Text>
                <HStack gap={20} style={{ marginTop: 18 }}>
                  <HStack gap={6} align="center">
                    <TrendingUp size={16} color="#FFFFFF" strokeWidth={2} />
                    <Text
                      variant="body-sm"
                      style={{ color: "rgba(255,255,255,0.82)" }}
                    >
                      ₹{(pnl?.income ?? 0).toLocaleString("en-IN")} in
                    </Text>
                  </HStack>
                  <HStack gap={6} align="center">
                    <TrendingDown size={16} color="#FFFFFF" strokeWidth={2} />
                    <Text
                      variant="body-sm"
                      style={{ color: "rgba(255,255,255,0.82)" }}
                    >
                      ₹{(pnl?.expense ?? 0).toLocaleString("en-IN")} out
                    </Text>
                  </HStack>
                </HStack>
              </GradientHero>

              {/* Income / expense bento */}
              <HStack gap={12}>
                <StatTile
                  label="Income"
                  value={`₹${(pnl?.income ?? 0).toLocaleString("en-IN")}`}
                  icon={TrendingUp}
                  tone="light"
                />
                <StatTile
                  label="Expense"
                  value={`₹${(pnl?.expense ?? 0).toLocaleString("en-IN")}`}
                  icon={TrendingDown}
                  tone="light"
                />
              </HStack>

              {/* Filters */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ gap: 8, alignItems: "center" }}
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
            </VStack>
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

        <Pressable style={styles.fabWrap} onPress={() => setAdding(true)}>
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
    <Card elevation="raised" style={styles.txRow}>
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
    </Card>
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
            style={{ marginTop: 14, flexGrow: 0 }}
            contentContainerStyle={{ gap: 8, alignItems: "center" }}
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
  chip: {
    height: layout.chipHeight,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: palette.ink[900],
    borderColor: palette.ink[900],
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
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
    height: layout.chipHeight,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  catChipActive: {
    backgroundColor: palette.ink[900],
    borderColor: palette.ink[900],
  },
});
