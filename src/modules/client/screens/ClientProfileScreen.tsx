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
  Mail,
  Phone,
  IdCard,
  Plus,
  X,
  Check,
  PawPrint,
  FileText,
  ChevronRight,
} from "lucide-react-native";
import {
  useClientProfile,
  useAssignGoat,
} from "@modules/client/hooks/useClients";
import { useGoats } from "@modules/goat/hooks/useGoats";
import { usePackages } from "@modules/billing/hooks/useBilling";
import { INVOICE_TONE } from "@modules/billing/types";
import { palette, radius, shadows, glass } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  Card,
  StatusChip,
  Button,
  GradientHero,
} from "@shared/ui";

export default function ClientProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const userId = route.params?.userId as string;
  const { data, isLoading } = useClientProfile(userId);
  const [assigning, setAssigning] = useState(false);

  if (isLoading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={palette.ink[700]} />
      </View>
    );
  }

  const { client, goats, subscriptions, invoices } = data;

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.topbar}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={8}
          >
            <ChevronLeft
              size={22}
              color={palette.text.primary}
              strokeWidth={2}
            />
          </Pressable>
          <Text variant="overline" tone="tertiary">
            Client
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingTop: 4,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          <GradientHero variant="forest">
            <HStack gap={14} align="center">
              <View style={[styles.avatar, glass.light]}>
                <Text variant="display-sm" tone="inverse">
                  {(client.user?.name || "C").charAt(0).toUpperCase()}
                </Text>
              </View>
              <VStack gap={6} flex={1}>
                <Text variant="h2" tone="inverse">
                  {client.user?.name}
                </Text>
                <View style={{ alignSelf: "flex-start" }}>
                  <StatusChip
                    label={client.status}
                    tone={client.status === "active" ? "success" : "neutral"}
                  />
                </View>
              </VStack>
            </HStack>
          </GradientHero>

          <Card style={{ marginTop: 16 }} elevation="raised">
            <VStack gap={10}>
              {client.user?.email ? (
                <Row
                  icon={<Mail size={16} color={palette.text.tertiary} />}
                  text={client.user.email}
                />
              ) : null}
              {client.user?.phone ? (
                <Row
                  icon={<Phone size={16} color={palette.text.tertiary} />}
                  text={client.user.phone}
                />
              ) : null}
              {client.kycNumber ? (
                <Row
                  icon={<IdCard size={16} color={palette.text.tertiary} />}
                  text={`${client.kycType?.toUpperCase()} · ${client.kycNumber}`}
                />
              ) : null}
            </VStack>
          </Card>

          {/* Assigned goats + packages */}
          <Card style={{ marginTop: 16 }} elevation="raised">
            <HStack
              justify="space-between"
              align="center"
              style={{ marginBottom: 12 }}
            >
              <Text variant="h4" tone="primary">
                Goats & packages
              </Text>
              <Pressable
                onPress={() => setAssigning(true)}
                style={styles.assignBtn}
              >
                <Plus
                  size={16}
                  color={palette.text.inverse}
                  strokeWidth={2.4}
                />
                <Text variant="label" tone="inverse">
                  Assign
                </Text>
              </Pressable>
            </HStack>
            {subscriptions.length === 0 ? (
              <Text variant="body-sm" tone="tertiary">
                No goats assigned yet.
              </Text>
            ) : (
              <VStack gap={10}>
                {subscriptions.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() =>
                      navigation.navigate("GoatProfile", { id: s.goat.id })
                    }
                    style={styles.subRow}
                  >
                    <View style={styles.goatIcon}>
                      <PawPrint
                        size={18}
                        color={palette.ink[600]}
                        strokeWidth={1.8}
                      />
                    </View>
                    <VStack gap={2} flex={1}>
                      <Text variant="label-lg" tone="primary">
                        {s.goat.name || s.goat.goatId}
                      </Text>
                      <Text variant="caption" tone="tertiary">
                        {s.packageName} package
                      </Text>
                    </VStack>
                    <Text variant="label-lg" tone="primary">
                      ₹{s.monthlyAmount.toLocaleString("en-IN")}/mo
                    </Text>
                  </Pressable>
                ))}
                <View style={styles.divider} />
                <HStack justify="space-between">
                  <Text variant="label" tone="secondary">
                    Monthly total
                  </Text>
                  <Text variant="h4" tone="primary">
                    ₹
                    {subscriptions
                      .reduce((a, s) => a + s.monthlyAmount, 0)
                      .toLocaleString("en-IN")}
                  </Text>
                </HStack>
              </VStack>
            )}
          </Card>

          {/* Documents */}
          <Card
            style={{ marginTop: 16 }}
            elevation="raised"
            onPress={() =>
              navigation.navigate("Documents", {
                clientUserId: userId,
                title: "Client documents",
              })
            }
          >
            <HStack gap={12} align="center">
              <View style={styles.goatIcon}>
                <FileText
                  size={18}
                  color={palette.ink[600]}
                  strokeWidth={1.8}
                />
              </View>
              <VStack gap={2} flex={1}>
                <Text variant="label-lg" tone="primary">
                  Documents
                </Text>
                <Text variant="caption" tone="tertiary">
                  KYC, agreement, certificates
                </Text>
              </VStack>
              <ChevronRight size={20} color={palette.text.tertiary} />
            </HStack>
          </Card>

          {/* Recent invoices */}
          {invoices.length > 0 && (
            <Card style={{ marginTop: 16 }} elevation="raised">
              <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
                Recent invoices
              </Text>
              <VStack gap={10}>
                {invoices.slice(0, 6).map((inv) => (
                  <Pressable
                    key={inv.id}
                    onPress={() =>
                      navigation.navigate("InvoiceDetail", { id: inv.id })
                    }
                    style={styles.invRow}
                  >
                    <VStack gap={2} flex={1}>
                      <Text variant="label" tone="primary">
                        {inv.invoiceNo} · {inv.period}
                      </Text>
                      <StatusChip
                        label={inv.status}
                        tone={INVOICE_TONE[inv.status]}
                      />
                    </VStack>
                    <Text variant="label-lg" tone="primary">
                      ₹{inv.total.toLocaleString("en-IN")}
                    </Text>
                  </Pressable>
                ))}
              </VStack>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>

      <AssignGoatModal
        userId={userId}
        visible={assigning}
        onClose={() => setAssigning(false)}
        assignedGoatIds={goats.map((g) => g.id)}
      />
    </View>
  );
}

function AssignGoatModal({
  userId,
  visible,
  onClose,
  assignedGoatIds,
}: {
  userId: string;
  visible: boolean;
  onClose: () => void;
  assignedGoatIds: string[];
}) {
  const { data: goatsData } = useGoats({ ownershipType: "farm" });
  const { data: packages } = usePackages();
  const assign = useAssignGoat(userId);
  const [goatId, setGoatId] = useState<string | null>(null);
  const [packageId, setPackageId] = useState<string | null>(null);

  const farmGoats = (goatsData?.data ?? []).filter(
    (g) => !assignedGoatIds.includes(g.id),
  );

  const submit = () => {
    if (!goatId || !packageId) return;
    assign.mutate(
      { goatId, packageId },
      {
        onSuccess: () => {
          setGoatId(null);
          setPackageId(null);
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
              Assign goat
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={22} color={palette.text.tertiary} />
            </Pressable>
          </HStack>

          <Text
            variant="label"
            tone="secondary"
            style={{ marginTop: 16, marginBottom: 8 }}
          >
            Farm goat
          </Text>
          <ScrollView style={{ maxHeight: 160 }}>
            <VStack gap={8}>
              {farmGoats.length === 0 ? (
                <Text variant="body-sm" tone="tertiary">
                  No unassigned farm goats. Register one first.
                </Text>
              ) : (
                farmGoats.map((g) => (
                  <Pressable
                    key={g.id}
                    onPress={() => setGoatId(g.id)}
                    style={[styles.pick, goatId === g.id && styles.pickActive]}
                  >
                    <Text variant="label-lg" tone="primary" style={{ flex: 1 }}>
                      {g.name || g.goatId}
                    </Text>
                    {goatId === g.id && (
                      <Check
                        size={18}
                        color={palette.ink[800]}
                        strokeWidth={2.4}
                      />
                    )}
                  </Pressable>
                ))
              )}
            </VStack>
          </ScrollView>

          <Text
            variant="label"
            tone="secondary"
            style={{ marginTop: 16, marginBottom: 8 }}
          >
            Package
          </Text>
          <View style={styles.wrapRow}>
            {(packages ?? []).map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setPackageId(p.id)}
                style={[
                  styles.pkgChip,
                  packageId === p.id && styles.pickActive,
                ]}
              >
                <Text
                  variant="label"
                  tone={packageId === p.id ? "primary" : "secondary"}
                >
                  {p.name} · ₹{p.monthlyAmount}
                </Text>
              </Pressable>
            ))}
          </View>

          <Button
            label="Assign on package"
            size="lg"
            loading={assign.isPending}
            disabled={!goatId || !packageId}
            onPress={submit}
            style={{ marginTop: 20 }}
          />
        </View>
      </View>
    </Modal>
  );
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <HStack gap={10} align="center">
      {icon}
      <Text variant="body-sm" tone="secondary">
        {text}
      </Text>
    </HStack>
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: palette.border.subtle,
    marginVertical: 16,
  },
  assignBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: palette.ink[900],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  subRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  goatIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: palette.ink[50],
    alignItems: "center",
    justifyContent: "center",
  },
  invRow: { flexDirection: "row", alignItems: "center", gap: 12 },
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
  pick: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  pickActive: {
    borderColor: palette.ink[800],
    backgroundColor: palette.ink[50],
  },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pkgChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
});
