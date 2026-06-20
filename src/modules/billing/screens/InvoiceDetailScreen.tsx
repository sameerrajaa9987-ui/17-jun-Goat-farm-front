import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeft, CheckCircle2, IndianRupee } from "lucide-react-native";
import { format } from "date-fns";
import {
  useInvoice,
  usePayInvoice,
  useRecordOffline,
  useCancelInvoice,
  useReversePayment,
} from "@modules/billing/hooks/useBilling";
import { INVOICE_TONE } from "@modules/billing/types";
import { useAuthStore } from "@shared/store/useAuthStore";
import { palette, radius, shadows } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  Card,
  StatusChip,
  Button,
  GradientHero,
} from "@shared/ui";

function fmtDate(d?: string | null) {
  if (!d) return "—";
  try {
    return format(new Date(d), "dd MMM yyyy");
  } catch {
    return d;
  }
}

export default function InvoiceDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id as string;
  const role = useAuthStore((s) => s.user?.role);
  const isClient = role === "client";
  const isAdmin = role === "owner" || role === "manager";
  const canManageBilling = useAuthStore((s) => s.hasPermission)(
    "manage_billing",
  );

  const { data, isLoading } = useInvoice(id);
  const pay = usePayInvoice();
  const recordOffline = useRecordOffline();
  const cancelInvoice = useCancelInvoice();
  const reversePayment = useReversePayment();

  if (isLoading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={palette.ink[700]} />
      </View>
    );
  }

  const { invoice, payments } = data;
  const unpaid = invoice.status === "due" || invoice.status === "overdue";
  const paid = invoice.status === "paid";

  const onCancelInvoice = () => {
    Alert.alert(
      "Cancel invoice",
      "This marks the invoice as cancelled. The client will no longer owe this bill. Continue?",
      [
        { text: "Keep invoice", style: "cancel" },
        {
          text: "Cancel invoice",
          style: "destructive",
          onPress: () =>
            cancelInvoice.mutate(id, {
              onError: (e: any) =>
                Alert.alert(
                  "Could not cancel",
                  e?.response?.data?.error?.message || "Try again.",
                ),
            }),
        },
      ],
    );
  };

  const onReversePayment = () => {
    Alert.alert(
      "Reverse payment",
      "This reverses the recorded payment and the matching finance entry, then reopens the bill as due/overdue. Continue?",
      [
        { text: "Keep payment", style: "cancel" },
        {
          text: "Reverse payment",
          style: "destructive",
          onPress: () =>
            reversePayment.mutate(id, {
              onError: (e: any) =>
                Alert.alert(
                  "Could not reverse",
                  e?.response?.data?.error?.message || "Try again.",
                ),
            }),
        },
      ],
    );
  };

  const onPay = () => {
    pay.mutate(id, {
      onError: (e: any) => {
        if (e?.message === "RAZORPAY_CHECKOUT_REQUIRED") {
          Alert.alert(
            "Razorpay",
            "Live Razorpay checkout opens here once keys are configured.",
          );
        } else {
          Alert.alert(
            "Payment failed",
            e?.response?.data?.error?.message || "Try again.",
          );
        }
      },
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
          <Text variant="h3" tone="primary">
            {invoice.invoiceNo}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Headline amount — premium money surface */}
          <GradientHero variant={unpaid ? "clay" : "hero"}>
            <HStack justify="space-between" align="flex-start">
              <VStack gap={4} flex={1}>
                <Text
                  variant="overline"
                  style={{ color: "rgba(255,255,255,0.66)" }}
                >
                  {invoice.period} ·{" "}
                  {isClient ? "Your bill" : invoice.client?.name}
                </Text>
                <Text variant="display-md" tone="inverse">
                  ₹{invoice.total.toLocaleString("en-IN")}
                </Text>
              </VStack>
              <StatusChip
                label={invoice.status}
                tone={INVOICE_TONE[invoice.status]}
              />
            </HStack>
            <View style={styles.heroDivider} />
            <HStack justify="space-between">
              <HeroMeta label="Issued" value={fmtDate(invoice.issuedAt)} />
              <HeroMeta label="Due" value={fmtDate(invoice.dueDate)} />
              <HeroMeta label="Paid" value={fmtDate(invoice.paidAt)} />
            </HStack>
          </GradientHero>

          {/* Line items */}
          <Card elevation="raised" style={{ marginTop: 16 }}>
            <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
              Items
            </Text>
            <VStack gap={10}>
              {invoice.lineItems.map((li) => (
                <HStack key={li.id} justify="space-between" align="center">
                  <VStack gap={2} flex={1}>
                    <Text variant="label-lg" tone="primary">
                      {li.goatName || "Goat"}
                    </Text>
                    <Text variant="caption" tone="tertiary">
                      {li.packageName} package
                    </Text>
                  </VStack>
                  <Text variant="label-lg" tone="primary">
                    ₹{li.amount.toLocaleString("en-IN")}
                  </Text>
                </HStack>
              ))}
              <View style={styles.divider} />
              <HStack justify="space-between">
                <Text variant="h4" tone="primary">
                  Total
                </Text>
                <Text variant="h4" tone="primary">
                  ₹{invoice.total.toLocaleString("en-IN")}
                </Text>
              </HStack>
            </VStack>
          </Card>

          {/* Payments */}
          {payments.length > 0 && (
            <Card elevation="raised" style={{ marginTop: 16 }}>
              <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
                Payments
              </Text>
              <VStack gap={8}>
                {payments.map((p) => (
                  <HStack key={p.id} justify="space-between" align="center">
                    <HStack gap={8} align="center">
                      <CheckCircle2 size={16} color={palette.success.text} />
                      <Text variant="body-sm" tone="secondary">
                        {p.method.toUpperCase()} · {fmtDate(p.paidAt)}
                      </Text>
                    </HStack>
                    <Text variant="label" tone="primary">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Card>
          )}

          {/* Actions */}
          {unpaid && isClient && (
            <Button
              label={`Pay ₹${invoice.total.toLocaleString("en-IN")}`}
              size="lg"
              icon={<IndianRupee size={18} color={palette.text.inverse} />}
              loading={pay.isPending}
              onPress={onPay}
              style={{ marginTop: 20 }}
            />
          )}
          {unpaid && isAdmin && (
            <VStack gap={10} style={{ marginTop: 20 }}>
              <Button
                label="Record cash payment"
                variant="secondary"
                loading={recordOffline.isPending}
                onPress={() => recordOffline.mutate({ id, method: "cash" })}
              />
              {canManageBilling && (
                <Button
                  label="Cancel invoice"
                  variant="destructive"
                  loading={cancelInvoice.isPending}
                  onPress={onCancelInvoice}
                />
              )}
            </VStack>
          )}
          {paid && canManageBilling && (
            <VStack gap={10} style={{ marginTop: 20 }}>
              <Button
                label="Reverse payment"
                variant="destructive"
                loading={reversePayment.isPending}
                onPress={onReversePayment}
              />
            </VStack>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function HeroMeta({ label, value }: { label: string; value: string }) {
  return (
    <VStack gap={2}>
      <Text variant="caption" style={{ color: "rgba(255,255,255,0.6)" }}>
        {label}
      </Text>
      <Text variant="label" tone="inverse">
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
  divider: {
    height: 1,
    backgroundColor: palette.border.subtle,
    marginVertical: 16,
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.16)",
    marginVertical: 16,
  },
});
