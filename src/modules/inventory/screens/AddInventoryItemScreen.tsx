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
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft } from "lucide-react-native";
import { useCreateItem } from "@modules/inventory/hooks/useInventory";
import { InventoryCategory, CATEGORY_LABEL } from "@modules/inventory/types";
import { palette, radius, shadows } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  Button,
  TextField,
  Card,
  useBottomPadding,
} from "@shared/ui";

const CATEGORIES: InventoryCategory[] = [
  "feed",
  "medicine",
  "equipment",
  "supplement",
  "mineral",
  "other",
];
const UNITS = ["kg", "litre", "bag", "sack", "piece", "dose", "bottle"];

export default function AddInventoryItemScreen() {
  const navigation = useNavigation<any>();
  const create = useCreateItem();
  const bottomPadding = useBottomPadding(40);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<InventoryCategory>("feed");
  const [unit, setUnit] = useState("kg");
  const [openingStock, setOpening] = useState("");
  const [minStock, setMin] = useState("");
  const [costPerUnit, setCost] = useState("");
  const [supplier, setSupplier] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    create.mutate(
      {
        name: name.trim(),
        category,
        unit,
        openingStock: openingStock ? Number(openingStock) : undefined,
        minStock: minStock ? Number(minStock) : undefined,
        costPerUnit: costPerUnit ? Number(costPerUnit) : undefined,
        supplier: supplier.trim() || undefined,
      },
      {
        onSuccess: (item) =>
          navigation.replace("InventoryItem", { id: item.id }),
      },
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
              Inventory
            </Text>
            <Text variant="h1" tone="primary">
              New item
            </Text>
          </VStack>
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
            <Card elevation="raised">
              <TextField
                label="Name"
                placeholder="e.g. Maize feed"
                value={name}
                onChangeText={setName}
              />

              <Label text="Category" />
              <View style={styles.wrapRow}>
                {CATEGORIES.map((c) => (
                  <Chip
                    key={c}
                    active={category === c}
                    label={CATEGORY_LABEL[c]}
                    onPress={() => setCategory(c)}
                  />
                ))}
              </View>

              <Label text="Unit" />
              <View style={styles.wrapRow}>
                {UNITS.map((u) => (
                  <Chip
                    key={u}
                    active={unit === u}
                    label={u}
                    onPress={() => setUnit(u)}
                  />
                ))}
              </View>
            </Card>

            <Card elevation="raised" style={{ marginTop: 16 }}>
              <VStack gap={16}>
                <HStack gap={12}>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label={`Opening stock (${unit})`}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      value={openingStock}
                      onChangeText={setOpening}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label={`Min level (${unit})`}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      value={minStock}
                      onChangeText={setMin}
                    />
                  </View>
                </HStack>
                <HStack gap={12}>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label="Cost ₹/unit"
                      placeholder="0"
                      keyboardType="number-pad"
                      value={costPerUnit}
                      onChangeText={setCost}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label="Supplier"
                      placeholder="Optional"
                      value={supplier}
                      onChangeText={setSupplier}
                    />
                  </View>
                </HStack>
              </VStack>
            </Card>

            <Button
              label="Add item"
              size="lg"
              loading={create.isPending}
              disabled={!name.trim()}
              onPress={submit}
              style={{ marginTop: 28 }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
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
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 16,
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
});
