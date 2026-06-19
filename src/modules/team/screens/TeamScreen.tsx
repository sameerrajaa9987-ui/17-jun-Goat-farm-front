import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { UserPlus, Power, Users, ChevronRight } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useUsers, useSetUserActive } from "@modules/team/hooks/useTeam";
import { TeamUser } from "@modules/team/types";
import { palette, radius, gradients, elevation } from "@shared/designSystem";
import { Text, VStack, HStack, Card, StatusChip, ChipsRow } from "@shared/ui";

const ROLE_FILTERS = ["all", "manager", "worker", "vet", "client"] as const;

export default function TeamScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<(typeof ROLE_FILTERS)[number]>("all");
  const params = filter === "all" ? undefined : { role: filter };
  const { data, isLoading, refetch, isRefetching } = useUsers(params);
  const setActive = useSetUserActive();

  const users = data?.data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <VStack gap={3} flex={1}>
            <Text variant="overline" tone="tertiary">
              People
            </Text>
            <Text variant="h1" tone="primary">
              Team
            </Text>
            <Text variant="body-sm" tone="tertiary">
              {data?.meta?.total ?? 0} accounts
            </Text>
          </VStack>
        </View>

        {/* Role filter chips */}
        <ChipsRow
          chips={ROLE_FILTERS.map((r) => ({
            key: r,
            label: r === "all" ? "All" : t(`roles.${r}`),
          }))}
          active={filter}
          onChange={(k) => setFilter(k as (typeof ROLE_FILTERS)[number])}
        />

        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{
            padding: 20,
            paddingTop: 12,
            paddingBottom: 110,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={palette.ink[700]}
            />
          }
          ListEmptyComponent={
            <VStack align="center" gap={10} style={{ marginTop: 60 }}>
              <View style={styles.emptyIcon}>
                <Users size={34} color={palette.ink[300]} strokeWidth={1.5} />
              </View>
              <Text variant="body" tone="tertiary">
                {isLoading ? t("common.loading") : "No team members yet."}
              </Text>
            </VStack>
          }
          renderItem={({ item }) => (
            <UserRow
              user={item}
              busy={setActive.isPending}
              onToggle={() =>
                setActive.mutate({ id: item.id, isActive: !item.isActive })
              }
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />

        <Pressable
          style={styles.fabWrap}
          onPress={() => navigation.navigate("AddUser")}
        >
          <LinearGradient
            colors={gradients.clay}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <UserPlus
              size={24}
              color={palette.text.inverse}
              strokeWidth={2.2}
            />
          </LinearGradient>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function UserRow({
  user,
  onToggle,
  busy,
}: {
  user: TeamUser;
  onToggle: () => void;
  busy: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Card elevation="raised">
      <HStack gap={12} align="center">
        <View style={styles.avatar}>
          <Text variant="label-lg" tone="inverse">
            {user.firstName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <VStack gap={4} flex={1}>
          <Text variant="label-lg" tone="primary">
            {user.fullName || user.firstName}
          </Text>
          <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
            {user.email}
          </Text>
          <HStack gap={6}>
            <StatusChip label={t(`roles.${user.role}`)} tone="info" />
            <StatusChip
              label={user.isActive ? "Active" : "Disabled"}
              tone={user.isActive ? "success" : "danger"}
            />
          </HStack>
        </VStack>
        {user.role !== "owner" ? (
          <Pressable
            onPress={onToggle}
            disabled={busy}
            hitSlop={8}
            style={styles.power}
          >
            <Power
              size={18}
              color={user.isActive ? palette.danger.text : palette.success.text}
              strokeWidth={1.8}
            />
          </Pressable>
        ) : (
          <ChevronRight
            size={18}
            color={palette.text.tertiary}
            strokeWidth={2}
          />
        )}
      </HStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: palette.ink[50],
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: palette.ink[700],
    alignItems: "center",
    justifyContent: "center",
  },
  power: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.border.default,
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
