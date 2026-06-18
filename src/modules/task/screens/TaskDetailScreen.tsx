import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import {
  ChevronLeft,
  Camera,
  Check,
  X,
  Play,
  CircleCheck,
} from "lucide-react-native";
import { format } from "date-fns";
import {
  useTask,
  useStartTask,
  useCompleteTask,
  useApproveTask,
  useRejectTask,
} from "@modules/task/hooks/useTasks";
import { TASK_TYPE_LABEL } from "@modules/task/types";
import { STATUS_LABEL, STATUS_TONE } from "@modules/task/taskMeta";
import { uploadImage } from "@modules/goat/api/goatApi";
import { mediaUrl } from "@modules/goat/screens/GoatListScreen";
import { useAuthStore } from "@shared/store/useAuthStore";
import { palette, radius } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  Card,
  StatusChip,
  Button,
  TextField,
} from "@shared/ui";

export default function TaskDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id as string;
  const user = useAuthStore((s) => s.user);
  const isManager = user?.role === "owner" || user?.role === "manager";

  const { data: task, isLoading } = useTask(id);
  const startMut = useStartTask();
  const completeMut = useCompleteTask();
  const approveMut = useApproveTask();
  const rejectMut = useRejectTask();

  const [proof, setProof] = useState<{ url: string; type: "image" }[]>([]);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [publish, setPublish] = useState(true);

  if (isLoading || !task) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={palette.ink[700]} />
      </View>
    );
  }

  const isOwn = task.assignedTo?.id === user?.id;
  const isClientGoat = task.goat?.ownershipType === "client";

  const addProof = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
    });
    if (res.canceled || !res.assets?.[0]) return;
    setUploading(true);
    try {
      const url = await uploadImage(res.assets[0].uri);
      setProof((p) => [...p, { url, type: "image" }]);
    } catch {
      // ignore
    } finally {
      setUploading(false);
    }
  };

  const submitComplete = () => {
    completeMut.mutate({ id, proof, workerNote: note.trim() || undefined });
  };

  const canComplete = ["pending", "in_progress", "rejected"].includes(
    task.status,
  );
  let due = task.dueDate;
  try {
    due = format(new Date(task.dueDate), "EEE dd MMM, HH:mm");
  } catch {
    /* raw */
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.topbar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <ChevronLeft size={26} color={palette.text.primary} />
          </Pressable>
          <Text variant="h3" tone="primary">
            Task
          </Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Card>
            <VStack gap={8}>
              <HStack justify="space-between" align="center">
                <StatusChip
                  label={STATUS_LABEL[task.status]}
                  tone={STATUS_TONE[task.status]}
                />
                {task.priority === "high" ? (
                  <StatusChip label="High priority" tone="danger" />
                ) : null}
              </HStack>
              <Text variant="h2" tone="primary">
                {task.title}
              </Text>
              <Text variant="body-sm" tone="tertiary">
                {TASK_TYPE_LABEL[task.type]} · Due {due}
              </Text>
              {task.goat ? (
                <Pressable
                  onPress={() =>
                    navigation.navigate("GoatProfile", { id: task.goat!.id })
                  }
                >
                  <Text variant="label" tone="accent">
                    Goat: {task.goat.name || task.goat.goatId}
                  </Text>
                </Pressable>
              ) : null}
              {task.assignedTo ? (
                <Text variant="body-sm" tone="secondary">
                  Assigned to {task.assignedTo.name}
                </Text>
              ) : null}
            </VStack>
          </Card>

          {task.status === "rejected" && task.rejectionReason ? (
            <Card
              style={{
                marginTop: 16,
                backgroundColor: palette.danger.bg,
                borderColor: palette.danger.border,
              }}
            >
              <Text
                variant="label"
                style={{ color: palette.danger.text, marginBottom: 4 }}
              >
                Sent back for rework
              </Text>
              <Text variant="body-sm" style={{ color: palette.danger.text }}>
                {task.rejectionReason}
              </Text>
            </Card>
          ) : null}

          {/* Existing proof */}
          {task.proof.length > 0 && (
            <Card style={{ marginTop: 16 }}>
              <Text variant="h4" tone="primary" style={{ marginBottom: 10 }}>
                Proof submitted
              </Text>
              <View style={styles.proofGrid}>
                {task.proof.map((p) => (
                  <Image
                    key={p.id}
                    source={{ uri: mediaUrl(p.url) }}
                    style={styles.proofImg}
                  />
                ))}
              </View>
              {task.workerNote ? (
                <Text
                  variant="body-sm"
                  tone="secondary"
                  style={{ marginTop: 10 }}
                >
                  “{task.workerNote}”
                </Text>
              ) : null}
            </Card>
          )}

          {/* Worker actions */}
          {!isManager && isOwn && task.status !== "approved" && (
            <Card style={{ marginTop: 16 }}>
              {task.status === "pending" && (
                <Button
                  label="Start task"
                  variant="secondary"
                  icon={<Play size={18} color={palette.text.primary} />}
                  loading={startMut.isPending}
                  onPress={() => startMut.mutate(id)}
                  style={{ marginBottom: 16 }}
                />
              )}
              {canComplete && (
                <>
                  <Text
                    variant="h4"
                    tone="primary"
                    style={{ marginBottom: 10 }}
                  >
                    Submit proof
                  </Text>
                  <View style={styles.proofGrid}>
                    {proof.map((p, i) => (
                      <Image
                        key={i}
                        source={{ uri: mediaUrl(p.url) }}
                        style={styles.proofImg}
                      />
                    ))}
                    <Pressable style={styles.addProof} onPress={addProof}>
                      {uploading ? (
                        <ActivityIndicator color={palette.ink[700]} />
                      ) : (
                        <Camera
                          size={22}
                          color={palette.text.tertiary}
                          strokeWidth={1.6}
                        />
                      )}
                    </Pressable>
                  </View>
                  <View style={{ marginTop: 12 }}>
                    <TextField
                      label="Note (optional)"
                      placeholder="Anything to add"
                      value={note}
                      onChangeText={setNote}
                    />
                  </View>
                  <Button
                    label="Mark done & submit"
                    size="lg"
                    icon={
                      <CircleCheck size={18} color={palette.text.inverse} />
                    }
                    loading={completeMut.isPending}
                    onPress={submitComplete}
                    style={{ marginTop: 16 }}
                  />
                </>
              )}
            </Card>
          )}

          {/* Manager approval */}
          {isManager && task.status === "submitted" && (
            <Card style={{ marginTop: 16 }}>
              <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
                Review
              </Text>
              {isClientGoat && (
                <Pressable
                  onPress={() => setPublish((v) => !v)}
                  style={styles.publishRow}
                >
                  <View style={[styles.checkbox, publish && styles.checkboxOn]}>
                    {publish && (
                      <Check
                        size={14}
                        color={palette.text.inverse}
                        strokeWidth={3}
                      />
                    )}
                  </View>
                  <Text variant="body-sm" tone="secondary" style={{ flex: 1 }}>
                    Publish this update to the Ad Pali client&apos;s portal
                  </Text>
                </Pressable>
              )}
              {showReject ? (
                <VStack gap={12} style={{ marginTop: 8 }}>
                  <TextField
                    label="Reason for rework"
                    placeholder="What needs fixing?"
                    value={rejectReason}
                    onChangeText={setRejectReason}
                  />
                  <HStack gap={10}>
                    <View style={{ flex: 1 }}>
                      <Button
                        label="Cancel"
                        variant="secondary"
                        onPress={() => setShowReject(false)}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        label="Reject"
                        variant="destructive"
                        loading={rejectMut.isPending}
                        disabled={rejectReason.trim().length < 2}
                        onPress={() =>
                          rejectMut.mutate(
                            { id, reason: rejectReason.trim() },
                            { onSuccess: () => setShowReject(false) },
                          )
                        }
                      />
                    </View>
                  </HStack>
                </VStack>
              ) : (
                <HStack gap={10} style={{ marginTop: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      label="Reject"
                      variant="secondary"
                      icon={<X size={18} color={palette.text.primary} />}
                      onPress={() => setShowReject(true)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      label="Approve"
                      icon={<Check size={18} color={palette.text.inverse} />}
                      loading={approveMut.isPending}
                      onPress={() =>
                        approveMut.mutate({
                          id,
                          publishToClient: isClientGoat ? publish : false,
                        })
                      }
                    />
                  </View>
                </HStack>
              )}
            </Card>
          )}

          {task.status === "approved" && (
            <Card
              style={{
                marginTop: 16,
                backgroundColor: palette.success.bg,
                borderColor: palette.success.border,
              }}
            >
              <HStack gap={8} align="center">
                <CircleCheck size={20} color={palette.success.text} />
                <Text
                  variant="label-lg"
                  style={{ color: palette.success.text }}
                >
                  Approved{task.approvedBy ? ` by ${task.approvedBy.name}` : ""}
                </Text>
              </HStack>
              {task.publishedToClient ? (
                <Text
                  variant="body-sm"
                  style={{ color: palette.success.text, marginTop: 6 }}
                >
                  Published to the client&apos;s portal.
                </Text>
              ) : null}
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
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
  proofGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  proofImg: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: palette.ink[50],
  },
  addProof: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: palette.border.strong,
    backgroundColor: palette.surface.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  publishRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.xs,
    borderWidth: 1.5,
    borderColor: palette.border.strong,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: {
    backgroundColor: palette.ink[900],
    borderColor: palette.ink[900],
  },
});
