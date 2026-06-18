import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ChevronLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  Pencil,
  X,
} from "lucide-react-native";
import { format } from "date-fns";
import {
  useInventoryItem,
  useInventoryMovements,
  useMoveStock,
} from "@modules/inventory/hooks/useInventory";
import {
  MovementType,
  CATEGORY_LABEL,
  StockMovement,
} from "@modules/inventory/types";
import { palette, radius, shadows } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  Card,
  StatusChip,
  Button,
  TextField,
} from "@shared/ui";

export default function InventoryItemScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id as string;
  const { data: item, isLoading } = useInventoryItem(id);
  const { data: movements } = useInventoryMovements(id);
  const [mode, setMode] = useState<MovementType | null>(null);

  if (isLoading || !item) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={palette.ink[700]} />
      </View>
    );
  }

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
              {CATEGORY_LABEL[item.category]}
            </Text>
            <Text variant="h1" tone="primary" numberOfLines={1}>
              {item.name}
            </Text>
          </VStack>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Card elevation="raised">
            <HStack justify="space-between" align="center">
              <VStack gap={4}>
                <Text variant="overline" tone="tertiary">
                  Current stock
                </Text>
                <HStack gap={6} align="flex-end">
                  <Text variant="display-md" tone="primary">
                    {item.currentStock}
                  </Text>
                  <Text
                    variant="body"
                    tone="tertiary"
                    style={{ marginBottom: 6 }}
                  >
                    {item.unit}
                  </Text>
                </HStack>
              </VStack>
              {item.isLow ? (
                <StatusChip label="Low stock" tone="danger" />
              ) : (
                <StatusChip label="In stock" tone="success" />
              )}
            </HStack>
            <View style={styles.divider} />
            <HStack justify="space-between">
              <Meta label="Category" value={CATEGORY_LABEL[item.category]} />
              <Meta label="Min level" value={`${item.minStock} ${item.unit}`} />
              <Meta label="₹/unit" value={`₹${item.costPerUnit}`} />
            </HStack>
            {item.supplier ? (
              <Text variant="body-sm" tone="tertiary" style={{ marginTop: 12 }}>
                Supplier: {item.supplier}
              </Text>
            ) : null}
          </Card>

          {/* Stock actions */}
          <HStack gap={10} style={{ marginTop: 16 }}>
            <View style={{ flex: 1 }}>
              <Button
                label="Stock in"
                icon={
                  <ArrowDownToLine size={18} color={palette.text.inverse} />
                }
                onPress={() => setMode("in")}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Stock out"
                variant="secondary"
                icon={
                  <ArrowUpFromLine size={18} color={palette.text.primary} />
                }
                onPress={() => setMode("out")}
              />
            </View>
          </HStack>
          <Pressable
            onPress={() => setMode("adjust")}
            style={{ marginTop: 12, alignSelf: "center" }}
            hitSlop={8}
          >
            <HStack gap={6} align="center">
              <Pencil size={14} color={palette.text.accent} />
              <Text variant="label" tone="accent">
                Adjust count
              </Text>
            </HStack>
          </Pressable>

          {/* Movement history */}
          <Text
            variant="h4"
            tone="primary"
            style={{ marginTop: 28, marginBottom: 12 }}
          >
            Movement history
          </Text>
          <VStack gap={10}>
            {(movements ?? []).map((m) => (
              <MovementRow key={m.id} m={m} unit={item.unit} />
            ))}
            {(movements ?? []).length === 0 && (
              <Text variant="body-sm" tone="tertiary">
                No movements yet.
              </Text>
            )}
          </VStack>
        </ScrollView>
      </SafeAreaView>

      <MoveModal
        id={id}
        unit={item.unit}
        mode={mode}
        onClose={() => setMode(null)}
      />
    </View>
  );
}

function MoveModal({
  id,
  unit,
  mode,
  onClose,
}: {
  id: string;
  unit: string;
  mode: MovementType | null;
  onClose: () => void;
}) {
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const move = useMoveStock(id);

  const titles: Record<MovementType, string> = {
    in: "Stock in",
    out: "Stock out",
    adjust: "Adjust count",
  };
  const submit = () => {
    const q = parseFloat(qty);
    if (!q || q < 0) return;
    move.mutate(
      { type: mode!, quantity: q, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          setQty("");
          setReason("");
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      visible={!!mode}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.sheetBackdrop}>
        <View style={styles.sheet}>
          <HStack justify="space-between" align="center">
            <Text variant="h3" tone="primary">
              {mode ? titles[mode] : ""}
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={22} color={palette.text.tertiary} />
            </Pressable>
          </HStack>
          <VStack gap={14} style={{ marginTop: 16 }}>
            <TextField
              label={
                mode === "adjust" ? `New count (${unit})` : `Quantity (${unit})`
              }
              placeholder="0"
              keyboardType="decimal-pad"
              value={qty}
              onChangeText={setQty}
            />
            <TextField
              label="Reason (optional)"
              placeholder={
                mode === "out" ? "e.g. daily feeding" : "e.g. purchase"
              }
              value={reason}
              onChangeText={setReason}
            />
            {move.isError ? (
              <Text variant="body-sm" tone="danger">
                {(move.error as any)?.response?.data?.error?.message ||
                  "Could not update stock."}
              </Text>
            ) : null}
            <Button
              label="Save"
              size="lg"
              loading={move.isPending}
              onPress={submit}
            />
          </VStack>
        </View>
      </View>
    </Modal>
  );
}

function MovementRow({ m, unit }: { m: StockMovement; unit: string }) {
  const positive = m.quantity > 0;
  let when = m.createdAt;
  try {
    when = format(new Date(m.createdAt), "dd MMM, HH:mm");
  } catch {
    /* raw */
  }
  return (
    <Card elevation="base" style={styles.moveRow}>
      <VStack gap={3} flex={1}>
        <Text variant="label" tone="primary">
          {m.type === "adjust"
            ? "Adjusted"
            : positive
              ? "Stock in"
              : "Stock out"}
          {m.reason ? ` · ${m.reason}` : ""}
        </Text>
        <Text variant="caption" tone="tertiary">
          {when} · bal {m.balanceAfter} {unit}
        </Text>
      </VStack>
      <Text
        variant="label-lg"
        style={{ color: positive ? palette.success.text : palette.danger.text }}
      >
        {positive ? "+" : ""}
        {m.quantity}
      </Text>
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <VStack gap={2}>
      <Text variant="caption" tone="tertiary">
        {label}
      </Text>
      <Text variant="label-lg" tone="primary">
        {value}
      </Text>
    </VStack>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface.secondary,
  },
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
  divider: {
    height: 1,
    backgroundColor: palette.border.subtle,
    marginVertical: 16,
  },
  moveRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
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
});
