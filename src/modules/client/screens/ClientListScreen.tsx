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
import { useNavigation } from "@react-navigation/native";
import {
  ChevronLeft,
  Plus,
  UsersRound,
  ChevronRight,
  ReceiptIndianRupee,
} from "lucide-react-native";
import { useClients } from "@modules/client/hooks/useClients";
import { ClientListItem } from "@modules/client/types";
import {
  palette,
  radius,
  shadows,
  gradients,
  elevation,
} from "@shared/designSystem";
import { Text, VStack, HStack, StatusChip, Card } from "@shared/ui";

export default function ClientListScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading, refetch, isRefetching } = useClients();
  const clients = data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.header}>
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
          <VStack gap={3} flex={1}>
            <Text variant="overline" tone="tertiary">
              Billing
            </Text>
            <Text variant="h1" tone="primary">
              Ad Pali clients
            </Text>
            <Text variant="body-sm" tone="tertiary">
              {clients.length} onboarded
            </Text>
          </VStack>
          <Pressable
            onPress={() => navigation.navigate("Invoices")}
            style={styles.actionBtn}
            hitSlop={8}
          >
            <ReceiptIndianRupee
              size={20}
              color={palette.ink[800]}
              strokeWidth={1.8}
            />
          </Pressable>
        </View>

        <FlatList
          data={clients}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{
            padding: 16,
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
            <VStack align="center" gap={10} style={{ marginTop: 70 }}>
              <View style={styles.emptyIcon}>
                <UsersRound
                  size={34}
                  color={palette.ink[300]}
                  strokeWidth={1.5}
                />
              </View>
              <Text variant="body" tone="tertiary">
                {isLoading ? "Loading..." : "No clients yet."}
              </Text>
            </VStack>
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <ClientRow
              client={item}
              onPress={() =>
                navigation.navigate("ClientProfile", { userId: item.userId })
              }
            />
          )}
        />

        <Pressable
          style={styles.fabWrap}
          onPress={() => navigation.navigate("AddClient")}
        >
          <LinearGradient
            colors={gradients.clay}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Plus size={24} color={palette.text.inverse} strokeWidth={2.4} />
          </LinearGradient>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function ClientRow({
  client,
  onPress,
}: {
  client: ClientListItem;
  onPress: () => void;
}) {
  return (
    <Card
      onPress={onPress}
      elevation="raised"
      padded={false}
      style={styles.card}
    >
      <HStack gap={12} align="center">
        <View style={styles.avatar}>
          <Text variant="label-lg" tone="inverse">
            {(client.user?.name || "C").charAt(0).toUpperCase()}
          </Text>
        </View>
        <VStack gap={4} flex={1}>
          <Text variant="label-lg" tone="primary">
            {client.user?.name || "Client"}
          </Text>
          <Text variant="caption" tone="tertiary">
            {client.user?.email}
          </Text>
          <HStack gap={6}>
            <StatusChip
              label={`${client.goatCount} goat${client.goatCount === 1 ? "" : "s"}`}
              tone="info"
            />
            {client.status === "inactive" ? (
              <StatusChip label="Inactive" tone="neutral" />
            ) : null}
          </HStack>
        </VStack>
        <ChevronRight size={18} color={palette.text.tertiary} strokeWidth={2} />
      </HStack>
    </Card>
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
  actionBtn: {
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
  card: { padding: 16 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    backgroundColor: palette.amber[600],
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: palette.ink[50],
    alignItems: "center",
    justifyContent: "center",
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
