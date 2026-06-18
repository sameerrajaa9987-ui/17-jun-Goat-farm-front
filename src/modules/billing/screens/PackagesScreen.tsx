import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Plus, X } from "lucide-react-native";
import {
  usePackages,
  useCreatePackage,
} from "@modules/billing/hooks/useBilling";
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

export default function PackagesScreen() {
  const navigation = useNavigation<any>();
  const { data: packages } = usePackages(true);
  const [adding, setAdding] = useState(false);

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
              Packages
            </Text>
          </VStack>
          <Pressable
            onPress={() => setAdding(true)}
            hitSlop={10}
            style={styles.iconBtn}
          >
            <Plus size={22} color={palette.ink[800]} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Text variant="body-sm" tone="tertiary" style={{ marginBottom: 16 }}>
            Monthly per-goat fees you charge Ad Pali clients. Configurable any
            time.
          </Text>
          <VStack gap={12}>
            {(packages ?? []).map((p) => (
              <Card key={p.id} elevation="raised">
                <HStack justify="space-between" align="center">
                  <VStack gap={4} flex={1}>
                    <HStack gap={8} align="center">
                      <Text variant="label-lg" tone="primary">
                        {p.name}
                      </Text>
                      {!p.isActive ? (
                        <StatusChip label="Inactive" tone="neutral" />
                      ) : null}
                    </HStack>
                    {p.description ? (
                      <Text variant="caption" tone="tertiary">
                        {p.description}
                      </Text>
                    ) : null}
                  </VStack>
                  <Text variant="h3" tone="primary">
                    ₹{p.monthlyAmount.toLocaleString("en-IN")}
                  </Text>
                </HStack>
              </Card>
            ))}
          </VStack>
        </ScrollView>
      </SafeAreaView>

      <AddPackageModal visible={adding} onClose={() => setAdding(false)} />
    </View>
  );
}

function AddPackageModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const create = useCreatePackage();

  const submit = () => {
    const a = Number(amount);
    if (!name.trim() || !a) return;
    create.mutate(
      {
        name: name.trim(),
        monthlyAmount: a,
        description: desc.trim() || undefined,
      },
      {
        onSuccess: () => {
          setName("");
          setAmount("");
          setDesc("");
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
      <View style={styles.sheetBackdrop}>
        <View style={styles.sheet}>
          <HStack justify="space-between" align="center">
            <Text variant="h3" tone="primary">
              New package
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={22} color={palette.text.tertiary} />
            </Pressable>
          </HStack>
          <VStack gap={14} style={{ marginTop: 16 }}>
            <TextField
              label="Name"
              placeholder="e.g. Deluxe"
              value={name}
              onChangeText={setName}
            />
            <TextField
              label="Monthly amount (₹)"
              placeholder="5000"
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <TextField
              label="Description (optional)"
              placeholder="What's included"
              value={desc}
              onChangeText={setDesc}
            />
            <Button
              label="Add package"
              size="lg"
              loading={create.isPending}
              onPress={submit}
            />
          </VStack>
        </View>
      </View>
    </Modal>
  );
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
    ...shadows.xl,
  },
});
