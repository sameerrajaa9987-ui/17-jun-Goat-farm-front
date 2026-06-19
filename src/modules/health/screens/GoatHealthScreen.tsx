import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
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
import {
  palette,
  radius,
  shadows,
  gradients,
  elevation,
} from "@shared/designSystem";
import { Text, VStack, HStack, StatusChip, GradientHero } from "@shared/ui";

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
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            style={styles.backBtn}
          >
            <ChevronLeft size={24} color={palette.text.primary} />
          </Pressable>
          <VStack gap={3} flex={1} style={{ marginLeft: 12 }}>
            <Text variant="overline" tone="tertiary">
              Health
            </Text>
            <Text variant="h3" tone="primary">
              Health timeline
            </Text>
          </VStack>
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
              <View style={{ marginBottom: 16 }}>
                <GradientHero variant="forest">
                  <VStack gap={8}>
                    <Text variant="h3" tone="inverse">
                      {goat.name || goat.goatId}
                    </Text>
                    <HStack gap={8} align="center">
                      <Text
                        variant="caption"
                        style={{ color: "rgba(255,255,255,0.74)" }}
                      >
                        Current status
                      </Text>
                      <StatusChip
                        label={goat.healthStatus.replace("_", " ")}
                        tone={
                          HEALTH_STATUS_TONE[goat.healthStatus] || "neutral"
                        }
                      />
                    </HStack>
                  </VStack>
                </GradientHero>
              </View>
            ) : null
          }
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <VStack align="center" gap={10} style={{ marginTop: 60 }}>
              <View style={styles.emptyIcon}>
                <HeartPulse
                  size={34}
                  color={palette.ink[300]}
                  strokeWidth={1.5}
                />
              </View>
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
            style={styles.fabWrap}
            onPress={() => navigation.navigate("AddHealthRecord", { goatId })}
          >
            <LinearGradient
              colors={gradients.clay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fab}
            >
              <Plus size={24} color={palette.text.inverse} strokeWidth={2.2} />
            </LinearGradient>
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
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: palette.ink[50],
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtn: {
    backgroundColor: palette.ink[900],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
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
});
