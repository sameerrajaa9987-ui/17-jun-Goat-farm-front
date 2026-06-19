import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ChevronLeft,
  QrCode,
  PawPrint,
  X,
  Scale,
  HeartPulse,
  ChevronRight,
  Tag,
} from "lucide-react-native";
import { format } from "date-fns";
import { useGoat, useGoatQr, useAddWeight } from "@modules/goat/hooks/useGoats";
import { mediaUrl } from "@modules/goat/screens/GoatListScreen";
import { WeightSparkline } from "@modules/goat/components/WeightSparkline";
import { useGoatProfitability } from "@modules/finance/hooks/useFinance";
import { useAuthStore } from "@shared/store/useAuthStore";
import { palette, radius, shadows } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  Card,
  StatusChip,
  Button,
  TextField,
  GradientHero,
} from "@shared/ui";

const HEALTH_TONE: Record<string, "success" | "warning" | "danger" | "info"> = {
  healthy: "success",
  under_treatment: "warning",
  critical: "danger",
  recovered: "info",
};

function ageFrom(dob: string | null) {
  if (!dob) return "—";
  const months = Math.max(
    0,
    Math.round(
      (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.4),
    ),
  );
  if (months < 12) return `${months} mo`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m ? `${y}y ${m}m` : `${y}y`;
}

export default function GoatProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id as string;
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canWeigh =
    hasPermission("manage_goats") || hasPermission("complete_tasks");
  const canFinance = hasPermission("manage_finance");
  const canSell = hasPermission("manage_sales");

  const { data: goat, isLoading } = useGoat(id);
  const { data: profit } = useGoatProfitability(id, canFinance);
  const [showQr, setShowQr] = useState(false);
  const [showWeigh, setShowWeigh] = useState(false);
  const { data: qr, isLoading: qrLoading } = useGoatQr(id, showQr);

  if (isLoading || !goat) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={palette.ink[700]} />
      </View>
    );
  }

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
          <VStack gap={3} flex={1} style={{ marginLeft: 12 }}>
            <Text variant="overline" tone="tertiary">
              Herd
            </Text>
            <Text variant="h3" tone="primary">
              Digital Passport
            </Text>
          </VStack>
          <Pressable
            onPress={() => setShowQr(true)}
            hitSlop={10}
            style={styles.backBtn}
          >
            <QrCode size={22} color={palette.ink[800]} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero — full-width cover passport */}
          {goat.photo ? (
            <View style={styles.cover}>
              <Image
                source={{ uri: mediaUrl(goat.photo) }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              <LinearGradient
                colors={[
                  "rgba(6,22,11,0)",
                  "rgba(6,22,11,0.35)",
                  "rgba(6,22,11,0.9)",
                ]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.coverContent}>
                <Text variant="h1" tone="inverse">
                  {goat.name || goat.goatId}
                </Text>
                <Text
                  variant="body-sm"
                  style={{ color: "rgba(255,255,255,0.82)", marginTop: 2 }}
                >
                  {goat.goatId}
                  {goat.earTagNo ? `  ·  Tag ${goat.earTagNo}` : ""}
                </Text>
                <HStack gap={6} wrap style={{ marginTop: 10 }}>
                  <StatusChip
                    label={
                      goat.ownership.type === "client"
                        ? "Ad Pali"
                        : "Farm-owned"
                    }
                    tone={goat.ownership.type === "client" ? "info" : "neutral"}
                  />
                  <StatusChip
                    label={goat.healthStatus.replace("_", " ")}
                    tone={HEALTH_TONE[goat.healthStatus]}
                  />
                </HStack>
              </View>
            </View>
          ) : (
            <GradientHero variant="forest">
              <VStack gap={10}>
                <View style={styles.coverPlaceholder}>
                  <PawPrint
                    size={34}
                    color={palette.ink[200]}
                    strokeWidth={1.6}
                  />
                </View>
                <Text variant="h1" tone="inverse">
                  {goat.name || goat.goatId}
                </Text>
                <Text
                  variant="body-sm"
                  style={{ color: "rgba(255,255,255,0.74)" }}
                >
                  {goat.goatId}
                  {goat.earTagNo ? `  ·  Tag ${goat.earTagNo}` : ""}
                </Text>
                <HStack gap={6} wrap>
                  <StatusChip
                    label={
                      goat.ownership.type === "client"
                        ? "Ad Pali"
                        : "Farm-owned"
                    }
                    tone={goat.ownership.type === "client" ? "info" : "neutral"}
                  />
                  <StatusChip
                    label={goat.healthStatus.replace("_", " ")}
                    tone={HEALTH_TONE[goat.healthStatus]}
                  />
                </HStack>
              </VStack>
            </GradientHero>
          )}

          {/* Weight */}
          <Card style={{ marginTop: 16 }}>
            <HStack justify="space-between" align="center">
              <VStack gap={2}>
                <Text variant="overline" tone="tertiary">
                  Current weight
                </Text>
                <Text variant="display-sm" tone="primary">
                  {goat.latestWeight != null ? `${goat.latestWeight} kg` : "—"}
                </Text>
              </VStack>
              {canWeigh && (
                <Pressable
                  style={styles.weighBtn}
                  onPress={() => setShowWeigh(true)}
                >
                  <Scale
                    size={16}
                    color={palette.text.inverse}
                    strokeWidth={2}
                  />
                  <Text variant="label" tone="inverse">
                    Add
                  </Text>
                </Pressable>
              )}
            </HStack>
            {goat.weightHistory.length >= 2 && (
              <View style={{ marginTop: 12, alignItems: "center" }}>
                <WeightSparkline data={goat.weightHistory} />
              </View>
            )}
            <Text variant="caption" tone="tertiary" style={{ marginTop: 8 }}>
              {goat.weightHistory.length} weigh-in
              {goat.weightHistory.length === 1 ? "" : "s"} recorded
            </Text>
          </Card>

          {/* Health & vaccinations */}
          <Card
            style={{ marginTop: 16 }}
            elevation="raised"
            onPress={() => navigation.navigate("GoatHealth", { id })}
          >
            <HStack gap={12} align="center">
              <View style={styles.healthIcon}>
                <HeartPulse
                  size={20}
                  color={palette.ink[700]}
                  strokeWidth={1.8}
                />
              </View>
              <VStack gap={2} flex={1}>
                <Text variant="label-lg" tone="primary">
                  Health & vaccinations
                </Text>
                <Text variant="caption" tone="tertiary">
                  Timeline, treatments, vaccine & deworming schedule
                </Text>
              </VStack>
              <ChevronRight size={20} color={palette.text.tertiary} />
            </HStack>
          </Card>

          {/* Documents */}
          <Card
            style={{ marginTop: 16 }}
            elevation="raised"
            onPress={() =>
              navigation.navigate("Documents", {
                goatId: id,
                title: "Goat documents",
              })
            }
          >
            <HStack gap={12} align="center">
              <View style={styles.healthIcon}>
                <Tag size={20} color={palette.ink[700]} strokeWidth={1.8} />
              </View>
              <VStack gap={2} flex={1}>
                <Text variant="label-lg" tone="primary">
                  Documents
                </Text>
                <Text variant="caption" tone="tertiary">
                  Certificates, bills, medical reports
                </Text>
              </VStack>
              <ChevronRight size={20} color={palette.text.tertiary} />
            </HStack>
          </Card>

          {/* Details */}
          <Card style={{ marginTop: 16 }}>
            <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
              Details
            </Text>
            <DetailRow label="Breed" value={goat.breed || "—"} />
            <DetailRow label="Colour" value={goat.color || "—"} />
            <DetailRow
              label="Gender"
              value={goat.gender === "male" ? "Male ♂" : "Female ♀"}
            />
            <DetailRow
              label="Date of birth"
              value={
                goat.dateOfBirth
                  ? format(new Date(goat.dateOfBirth), "dd MMM yyyy")
                  : "—"
              }
            />
            <DetailRow label="Age" value={ageFrom(goat.dateOfBirth)} />
            <DetailRow
              label="Purchase price"
              value={
                goat.purchasePrice
                  ? `₹${goat.purchasePrice.toLocaleString("en-IN")}`
                  : "—"
              }
            />
            <DetailRow
              label="Current value"
              value={
                goat.currentValue
                  ? `₹${goat.currentValue.toLocaleString("en-IN")}`
                  : "—"
              }
            />
            <DetailRow label="Status" value={goat.status} last />
          </Card>

          {/* Ownership */}
          {goat.ownership.type === "client" && (
            <Card style={{ marginTop: 16 }}>
              <Text variant="h4" tone="primary" style={{ marginBottom: 8 }}>
                Ad Pali client
              </Text>
              <Text variant="body" tone="secondary">
                {goat.ownership.clientName || "—"}
              </Text>
            </Card>
          )}

          {/* Lineage */}
          {(goat.sire || goat.dam) && (
            <Card style={{ marginTop: 16 }}>
              <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
                Lineage
              </Text>
              <HStack gap={12}>
                <ParentChip
                  label="Sire ♂"
                  parent={goat.sire}
                  onPress={(pid) => navigation.push("GoatProfile", { id: pid })}
                />
                <ParentChip
                  label="Dam ♀"
                  parent={goat.dam}
                  onPress={(pid) => navigation.push("GoatProfile", { id: pid })}
                />
              </HStack>
            </Card>
          )}

          {goat.notes ? (
            <Card style={{ marginTop: 16 }}>
              <Text variant="h4" tone="primary" style={{ marginBottom: 8 }}>
                Notes
              </Text>
              <Text variant="body-sm" tone="secondary">
                {goat.notes}
              </Text>
            </Card>
          ) : null}

          {/* Profitability (managers, farm-owned) */}
          {canFinance && profit && goat.ownership.type === "farm" ? (
            <Card style={{ marginTop: 16 }}>
              <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
                Profitability
              </Text>
              <DetailRow
                label="Purchase price"
                value={`₹${profit.purchasePrice.toLocaleString("en-IN")}`}
              />
              <DetailRow
                label="Recorded costs"
                value={`₹${profit.expenses.toLocaleString("en-IN")}`}
              />
              {profit.saleIncome > 0 ? (
                <DetailRow
                  label="Sale income"
                  value={`₹${profit.saleIncome.toLocaleString("en-IN")}`}
                />
              ) : null}
              <DetailRow
                label={
                  goat.status === "sold"
                    ? "Net profit"
                    : "If sold at current value"
                }
                value={`₹${(goat.status === "sold" ? profit.profit : goat.currentValue - profit.totalCost).toLocaleString("en-IN")}`}
                last
              />
            </Card>
          ) : null}

          {/* Sell action */}
          {canSell && goat.status === "active" ? (
            <Button
              label="Sell this goat"
              variant="secondary"
              icon={<Tag size={18} color={palette.text.primary} />}
              style={{ marginTop: 20 }}
              onPress={() => navigation.navigate("SellGoat", { goatId: id })}
            />
          ) : null}
        </ScrollView>
      </SafeAreaView>

      {/* QR modal */}
      <Modal
        visible={showQr}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQr(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowQr(false)}
        >
          <Pressable style={styles.qrCard}>
            <HStack
              justify="space-between"
              align="center"
              style={{ width: "100%" }}
            >
              <Text variant="h4" tone="primary">
                {goat.goatId}
              </Text>
              <Pressable onPress={() => setShowQr(false)} hitSlop={10}>
                <X size={22} color={palette.text.tertiary} />
              </Pressable>
            </HStack>
            {qrLoading || !qr ? (
              <ActivityIndicator
                color={palette.ink[700]}
                style={{ marginVertical: 60 }}
              />
            ) : (
              <Image source={{ uri: qr.dataUrl }} style={styles.qrImage} />
            )}
            <Text variant="caption" tone="tertiary" align="center">
              Scan in the field to open this passport
            </Text>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add weight modal */}
      <AddWeightModal
        id={id}
        visible={showWeigh}
        onClose={() => setShowWeigh(false)}
      />
    </View>
  );
}

function AddWeightModal({
  id,
  visible,
  onClose,
}: {
  id: string;
  visible: boolean;
  onClose: () => void;
}) {
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const mut = useAddWeight(id);

  const submit = () => {
    const w = parseFloat(weight);
    if (!w || w <= 0) return;
    mut.mutate(
      { weightKg: w, note: note.trim() || undefined },
      {
        onSuccess: () => {
          setWeight("");
          setNote("");
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
              Add weigh-in
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={22} color={palette.text.tertiary} />
            </Pressable>
          </HStack>
          <VStack gap={14} style={{ marginTop: 16 }}>
            <TextField
              label="Weight (kg)"
              placeholder="e.g. 24.5"
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={setWeight}
            />
            <TextField
              label="Note (optional)"
              placeholder="e.g. weekly check"
              value={note}
              onChangeText={setNote}
            />
            <Button
              label="Save weigh-in"
              size="lg"
              loading={mut.isPending}
              onPress={submit}
            />
          </VStack>
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !last && styles.detailBorder]}>
      <Text variant="body-sm" tone="tertiary">
        {label}
      </Text>
      <Text variant="label" tone="primary">
        {value}
      </Text>
    </View>
  );
}

function ParentChip({
  label,
  parent,
  onPress,
}: {
  label: string;
  parent: { id: string; goatId?: string; name?: string } | null;
  onPress: (id: string) => void;
}) {
  if (!parent) {
    return (
      <View style={[styles.parent, { opacity: 0.5 }]}>
        <Text variant="caption" tone="tertiary">
          {label}
        </Text>
        <Text variant="label" tone="tertiary">
          Unknown
        </Text>
      </View>
    );
  }
  return (
    <Pressable style={styles.parent} onPress={() => onPress(parent.id)}>
      <Text variant="caption" tone="tertiary">
        {label}
      </Text>
      <Text variant="label" tone="primary">
        {parent.name || parent.goatId}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface.secondary,
  },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: palette.surface.primary,
    borderWidth: 1,
    borderColor: palette.border.default,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.xs,
  },
  cover: {
    height: 260,
    marginTop: -20,
    marginHorizontal: -20,
    borderBottomLeftRadius: radius["2xl"],
    borderBottomRightRadius: radius["2xl"],
    overflow: "hidden",
    backgroundColor: palette.ink[900],
    justifyContent: "flex-end",
  },
  coverContent: { padding: 20 },
  coverPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  healthIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: palette.ink[50],
    alignItems: "center",
    justifyContent: "center",
  },
  weighBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: palette.ink[900],
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
  },
  detailBorder: {
    borderBottomWidth: 1,
    borderBottomColor: palette.border.subtle,
  },
  parent: {
    flex: 1,
    gap: 4,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.secondary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10,30,16,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  qrCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: palette.surface.primary,
    borderRadius: radius["2xl"],
    padding: 20,
    alignItems: "center",
    gap: 16,
    ...shadows.xl,
  },
  qrImage: { width: 220, height: 220, borderRadius: radius.md },
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
