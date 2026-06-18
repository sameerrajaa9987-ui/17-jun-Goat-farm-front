import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { UserPlus, Power } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useUsers, useSetUserActive } from "@modules/team/hooks/useTeam";
import { TeamUser } from "@modules/team/types";
import { palette, radius } from "@shared/designSystem";
import { Text, VStack, HStack, Card, StatusChip } from "@shared/ui";

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
          <VStack gap={2} flex={1}>
            <Text variant="h1" tone="primary">
              Team
            </Text>
            <Text variant="body-sm" tone="tertiary">
              {data?.meta?.total ?? 0} accounts
            </Text>
          </VStack>
          <Pressable
            style={styles.addBtn}
            onPress={() => navigation.navigate("AddUser")}
          >
            <UserPlus size={18} color={palette.text.inverse} strokeWidth={2} />
            <Text variant="label" tone="inverse">
              Add
            </Text>
          </Pressable>
        </View>

        {/* Role filter chips */}
        <View style={styles.filters}>
          {ROLE_FILTERS.map((r) => {
            const active = filter === r;
            return (
              <Pressable
                key={r}
                onPress={() => setFilter(r)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text
                  variant="label"
                  style={{
                    color: active
                      ? palette.text.inverse
                      : palette.text.secondary,
                  }}
                >
                  {r === "all" ? "All" : t(`roles.${r}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{
            padding: 20,
            paddingTop: 8,
            paddingBottom: 40,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={palette.ink[700]}
            />
          }
          ListEmptyComponent={
            <Text
              variant="body"
              tone="tertiary"
              align="center"
              style={{ marginTop: 40 }}
            >
              {isLoading ? t("common.loading") : "No team members yet."}
            </Text>
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
    <Card>
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
        {user.role !== "owner" && (
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
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: palette.ink[900],
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  chipActive: {
    backgroundColor: palette.ink[900],
    borderColor: palette.ink[900],
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
});
