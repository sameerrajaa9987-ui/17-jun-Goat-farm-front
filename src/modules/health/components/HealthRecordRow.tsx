import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import {
  Syringe,
  Pill,
  Stethoscope,
  ShieldPlus,
  ClipboardCheck,
  FileText,
  Bug,
} from "lucide-react-native";
import { format } from "date-fns";
import {
  HealthRecord,
  HEALTH_TYPE_LABEL,
  HealthType,
} from "@modules/health/types";
import { RECORD_STATUS_TONE } from "@modules/health/healthMeta";
import { palette, radius } from "@shared/designSystem";
import { Text, VStack, HStack, StatusChip } from "@shared/ui";

const ICONS: Record<HealthType, React.ComponentType<any>> = {
  vaccination: Syringe,
  deworming: Bug,
  treatment: Pill,
  diagnosis: Stethoscope,
  checkup: ClipboardCheck,
  prescription: ShieldPlus,
  note: FileText,
};

function fmt(d: string | null) {
  if (!d) return "";
  try {
    return format(new Date(d), "dd MMM yyyy");
  } catch {
    return d;
  }
}

export function HealthRecordRow({
  record,
  showGoat,
  onPress,
  trailing,
}: {
  record: HealthRecord;
  showGoat?: boolean;
  onPress?: () => void;
  trailing?: React.ReactNode;
}) {
  const Icon = ICONS[record.type] || FileText;
  const isScheduled =
    record.status === "scheduled" || record.status === "overdue";
  const date = isScheduled
    ? `Due ${fmt(record.dueDate)}`
    : fmt(record.performedAt || record.createdAt);

  const Body = (
    <HStack gap={12} align="flex-start">
      <View style={styles.icon}>
        <Icon size={18} color={palette.ink[700]} strokeWidth={1.8} />
      </View>
      <VStack gap={4} flex={1}>
        <HStack gap={8} align="center" wrap>
          <Text variant="label-lg" tone="primary">
            {record.title}
          </Text>
          {record.status !== "completed" ? (
            <StatusChip
              label={record.status}
              tone={RECORD_STATUS_TONE[record.status]}
            />
          ) : null}
        </HStack>
        <Text variant="caption" tone="tertiary">
          {HEALTH_TYPE_LABEL[record.type]} · {date}
          {showGoat && record.goat
            ? ` · ${record.goat.name || record.goat.goatId}`
            : ""}
        </Text>
        {record.medicine ? (
          <Text variant="body-sm" tone="secondary">
            {record.medicine}
            {record.dosage ? ` · ${record.dosage}` : ""}
          </Text>
        ) : null}
        {record.description ? (
          <Text variant="body-sm" tone="secondary" numberOfLines={2}>
            {record.description}
          </Text>
        ) : null}
      </VStack>
      {trailing}
    </HStack>
  );

  return (
    <View style={styles.card}>
      {onPress ? (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => pressed && { opacity: 0.9 }}
        >
          {Body}
        </Pressable>
      ) : (
        Body
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface.primary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 16,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: palette.ink[50],
    alignItems: "center",
    justifyContent: "center",
  },
});
