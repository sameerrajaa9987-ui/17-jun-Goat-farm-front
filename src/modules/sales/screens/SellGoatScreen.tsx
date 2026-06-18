import React, { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeft } from "lucide-react-native";
import { useSellGoat } from "@modules/sales/hooks/useSales";
import { useGoats } from "@modules/goat/hooks/useGoats";
import { useGoatProfitability } from "@modules/finance/hooks/useFinance";
import { palette, radius } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  Card,
  Button,
  TextField,
  StatusChip,
  useBottomPadding,
} from "@shared/ui";

type ApiErr = { response?: { data?: { error?: { message?: string } } } };
const METHODS = ["cash", "upi", "bank"];

export default function SellGoatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const presetGoatId = route.params?.goatId as string | undefined;
  const sell = useSellGoat();
  const bottomPadding = useBottomPadding(40);

  const [goatId, setGoatId] = useState<string | null>(presetGoatId ?? null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [method, setMethod] = useState("cash");
  const [notes, setNotes] = useState("");

  const { data: goatsData } = useGoats({ status: "active" });
  const goats = goatsData?.data ?? [];
  const { data: profit } = useGoatProfitability(goatId || "", !!goatId);

  const price = Number(salePrice) || 0;
  const isClientGoat = profit?.ownershipType === "client";
  const previewProfit =
    profit && !isClientGoat ? price - profit.totalCost : null;

  const submit = () => {
    if (!goatId || !price) return;
    sell.mutate(
      {
        goatId,
        buyerName: buyerName.trim() || undefined,
        buyerPhone: buyerPhone.trim() || undefined,
        salePrice: price,
        paymentMethod: method,
        notes: notes.trim() || undefined,
      },
      { onSuccess: () => navigation.navigate("Sales") },
    );
  };

  const errMsg =
    (sell.error as ApiErr)?.response?.data?.error?.message ||
    "Could not record sale.";

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.primary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.topbar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <ChevronLeft size={26} color={palette.text.primary} />
          </Pressable>
          <Text variant="h3" tone="primary">
            Sell goat
          </Text>
          <View style={{ width: 26 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 8,
              paddingBottom: bottomPadding,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {sell.isError && (
              <View style={styles.error}>
                <Text variant="body-sm" tone="danger">
                  {errMsg}
                </Text>
              </View>
            )}

            {!presetGoatId && (
              <>
                <Label text="Goat" />
                <View style={styles.wrapRow}>
                  {goats.map((g) => (
                    <Chip
                      key={g.id}
                      active={goatId === g.id}
                      label={g.name || g.goatId}
                      onPress={() => setGoatId(g.id)}
                    />
                  ))}
                </View>
              </>
            )}

            <VStack gap={16} style={{ marginTop: 20 }}>
              <TextField
                label="Sale price (₹)"
                placeholder="12000"
                keyboardType="number-pad"
                value={salePrice}
                onChangeText={setSalePrice}
              />
              <HStack gap={12}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Buyer name"
                    placeholder="e.g. Imran Traders"
                    value={buyerName}
                    onChangeText={setBuyerName}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Buyer phone"
                    placeholder="+91..."
                    keyboardType="phone-pad"
                    value={buyerPhone}
                    onChangeText={setBuyerPhone}
                  />
                </View>
              </HStack>
            </VStack>

            <Label text="Payment" />
            <HStack gap={8}>
              {METHODS.map((m) => (
                <Chip
                  key={m}
                  active={method === m}
                  label={m.toUpperCase()}
                  onPress={() => setMethod(m)}
                />
              ))}
            </HStack>

            <View style={{ marginTop: 16 }}>
              <TextField
                label="Notes"
                placeholder="Optional"
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Profit preview */}
            {goatId && profit && (
              <Card style={{ marginTop: 20 }}>
                {isClientGoat ? (
                  <VStack gap={6}>
                    <StatusChip label="Ad Pali client goat" tone="info" />
                    <Text variant="body-sm" tone="secondary">
                      This is a handover — no farm profit, and Ad Pali billing
                      stops once it leaves the farm.
                    </Text>
                  </VStack>
                ) : (
                  <VStack gap={8}>
                    <Text variant="overline" tone="tertiary">
                      Profit preview
                    </Text>
                    <PreviewRow label="Sale price" value={price} />
                    <PreviewRow
                      label="Purchase price"
                      value={-profit.purchasePrice}
                    />
                    <PreviewRow
                      label="Recorded costs"
                      value={-profit.expenses}
                    />
                    <View style={styles.divider} />
                    <HStack justify="space-between">
                      <Text variant="h4" tone="primary">
                        Net profit
                      </Text>
                      <Text
                        variant="h4"
                        style={{
                          color:
                            (previewProfit ?? 0) >= 0
                              ? palette.success.text
                              : palette.danger.text,
                        }}
                      >
                        ₹{(previewProfit ?? 0).toLocaleString("en-IN")}
                      </Text>
                    </HStack>
                  </VStack>
                )}
              </Card>
            )}

            <Button
              label="Record sale"
              size="lg"
              loading={sell.isPending}
              disabled={!goatId || !price}
              onPress={submit}
              style={{ marginTop: 24 }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function PreviewRow({ label, value }: { label: string; value: number }) {
  return (
    <HStack justify="space-between">
      <Text variant="body-sm" tone="secondary">
        {label}
      </Text>
      <Text variant="label" tone={value < 0 ? "danger" : "primary"}>
        {value < 0 ? "−" : ""}₹{Math.abs(value).toLocaleString("en-IN")}
      </Text>
    </HStack>
  );
}

function Label({ text }: { text: string }) {
  return (
    <Text
      variant="label"
      tone="secondary"
      style={{ marginTop: 20, marginBottom: 8 }}
    >
      {text}
    </Text>
  );
}
function Chip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text
        variant="label"
        style={{
          color: active ? palette.text.inverse : palette.text.secondary,
        }}
      >
        {label}
      </Text>
    </Pressable>
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
  error: {
    marginBottom: 16,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: palette.danger.bg,
    borderWidth: 1,
    borderColor: palette.danger.border,
  },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
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
  divider: {
    height: 1,
    backgroundColor: palette.border.subtle,
    marginVertical: 6,
  },
});
