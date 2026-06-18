import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeft, Plus, HeartPulse } from "lucide-react-native";
import {
  useHealthTimeline,
  useCompleteScheduled,
} from "@modules/health/hooks/useHealth";
import { useGoat } from "@modules/goat/hooks/useGoats";
import { HealthRecordRow } from "@modules/health/components/HealthRecordRow";
import { HEALTH_STATUS_TONE } from "@modules/health/healthMeta";
import { useAuthStore } from "@shared/store/useAuthStore";
import { palette, radius, shadows } from "@shared/designSystem";
import { Text, VStack, HStack, StatusChip } from "@shared/ui";

export default function GoatHealthScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const goatId = route.params?.id as string;
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canManage = hasPermission("manage_health");

  const { data: goat } = useGoat(goatId);
  const {
    data: timeline,
    isLoading,
    refetch,
    isRefetching,
  } = useHealthTimeline(goatId);
  const complete = useCompleteScheduled();

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.topbar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <ChevronLeft size={26} color={palette.text.primary} />
          </Pressable>
          <Text variant="h3" tone="primary">
            Health timeline
          </Text>
          <View style={{ width: 26 }} />
        </View>

        <FlatList
          data={timeline ?? []}
          keyExtractor={(r) => r.id}
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
          ListHeaderComponent={
            goat ? (
              <View style={styles.headerCard}>
                <VStack gap={6}>
                  <Text variant="h3" tone="primary">
                    {goat.name || goat.goatId}
                  </Text>
                  <HStack gap={8} align="center">
                    <Text variant="caption" tone="tertiary">
                      Current status
                    </Text>
                    <StatusChip
                      label={goat.healthStatus.replace("_", " ")}
                      tone={HEALTH_STATUS_TONE[goat.healthStatus] || "neutral"}
                    />
                  </HStack>
                </VStack>
              </View>
            ) : null
          }
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <VStack align="center" gap={8} style={{ marginTop: 60 }}>
              <HeartPulse
                size={40}
                color={palette.text.disabled}
                strokeWidth={1.5}
              />
              <Text variant="body" tone="tertiary">
                {isLoading ? "Loading..." : "No health records yet."}
              </Text>
            </VStack>
          }
          renderItem={({ item }) => (
            <HealthRecordRow
              record={item}
              trailing={
                canManage &&
                (item.status === "scheduled" || item.status === "overdue") ? (
                  <Pressable
                    onPress={() => complete.mutate({ id: item.id, body: {} })}
                    disabled={complete.isPending}
                    style={styles.doneBtn}
                  >
                    <Text variant="label-sm" tone="inverse">
                      Done
                    </Text>
                  </Pressable>
                ) : undefined
              }
            />
          )}
        />

        {canManage && (
          <Pressable
            style={styles.fab}
            onPress={() => navigation.navigate("AddHealthRecord", { goatId })}
          >
            <Plus size={24} color={palette.text.inverse} strokeWidth={2.2} />
          </Pressable>
        )}
      </SafeAreaView>
    </View>
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
  headerCard: {
    backgroundColor: palette.surface.primary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 16,
    marginBottom: 16,
    ...shadows.xs,
  },
  doneBtn: {
    backgroundColor: palette.ink[900],
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
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
});
