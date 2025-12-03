import React, { useEffect, useState, useRef, useCallback } from "react";
import { SafeAreaView, View, FlatList, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Text, Alert, Dimensions } from "react-native";
import { messages, auth, usersApi, API_BASE_URL, callsApi } from "../services/api";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { ThemedText } from "@/components/themed-text";

export default function ChatScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [callLoading, setCallLoading] = useState(false);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const { user_id } = useLocalSearchParams();
  // Compute a nearly-full-width bubble max size based on device screen width
  const windowWidth = Dimensions.get("window").width;
  const BUBBLE_MAX_WIDTH = Math.max(240, Math.floor(windowWidth * 0.85) - 24);

  const loadChat = useCallback(async () => {
    try {
      const [userRes] = await Promise.all([auth.me()]);
      setCurrentUser(userRes.data);

      if (user_id) {
        const params: any = { user_id };
        const res = await messages.list(params).catch((e) => {
          console.warn("[chat] messages.list error", e?.message || e);
          return { data: [] };
        });
        const msgList = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        // Ensure messages are in chronological order (oldest first) so latest appear at the bottom
        const ordered = (msgList || []).slice().reverse();
        setItems(ordered);
        // Minimal debug log: number of messages loaded
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.debug("[chat] messages loaded", ordered.length);
        }

        // Get other user info from first message if available
        if (msgList.length > 0) {
          const firstMsg = msgList[0];
          const other = firstMsg.sender_id === userRes.data.id ? firstMsg.receiver : firstMsg.sender;
          setOtherUser(other);
        } else {
          // No messages yet — fetch the other user's profile so header can show
          try {
            const ures = await usersApi.get(Number(user_id));
            setOtherUser(ures.data);
          } catch (e) {
            // ignore
          }
        }
      }
    } catch (err: any) {
      console.warn(err);
      if (err?.response?.status === 401) router.replace("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [user_id, router]);

  useFocusEffect(
    useCallback(() => {
      loadChat();
    }, [loadChat])
  );

  useEffect(() => {
    if (items.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [items]);

  const handleSend = async () => {
    if (!user_id || !message.trim()) return;

    const messageText = message;
    setMessage("");

    // Optimistic UI: append a temporary message immediately
    const tempId = `temp-${Date.now()}`;
    const tempMessage: any = {
      id: tempId,
      sender_id: currentUser?.id,
      receiver_id: Number(user_id),
      content: messageText,
      created_at: new Date().toISOString(),
      sender: currentUser,
      receiver: otherUser,
    };

    setItems((prev) => [...prev, tempMessage]);
    flatListRef.current?.scrollToEnd({ animated: true });

    try {
      await messages.send({ receiver_id: Number(user_id), content: messageText });
      // Refresh list from server to get authoritative data (IDs, ordering)
      const res = await messages.list({ user_id });
      const msgList = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      // keep chronological order oldest->newest
      setItems((msgList || []).slice().reverse());
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err: any) {
      // keep error logging minimal to avoid performance issues
      console.warn("[chat] send error", err?.message || err);
      // remove temporary message and restore input
      setItems((prev) => prev.filter((m) => String(m.id) !== String(tempId)));
      setMessage(messageText);
    }
  };

  const handleCall = async () => {
    if (!user_id || !currentUser?.id) return;
    setCallLoading(true);
    try {
      const res = await callsApi.create({ callee_id: Number(user_id) });
      if (typeof __DEV__ !== "undefined" && __DEV__) console.debug("[chat] call created:", res);
      router.push(`/calls/${res.data.data?.id || res.data?.id}`);
    } catch (err: any) {
      console.warn("[chat] call error", err?.message || err);
      alert("Failed to initiate call. Please try again.");
    } finally {
      setCallLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.backButton}>← Back</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            Messages
          </ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>← Back</ThemedText>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          {otherUser && (
            <>
              <ThemedText type="subtitle" style={styles.headerName}>
                {otherUser.name}
              </ThemedText>
              <ThemedText style={styles.headerSubtitle}>Active now</ThemedText>
            </>
          )}
        </View>
        <TouchableOpacity style={styles.callButton} onPress={handleCall} disabled={callLoading}>
          <ThemedText style={styles.callButtonText}>📞</ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={items}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => {
          const isCurrentUser = item.sender_id === currentUser?.id;
          return (
            <View style={[styles.messageWrapper, isCurrentUser ? styles.currentUserWrapper : styles.otherUserWrapper]}>
              <TouchableOpacity
                activeOpacity={0.9}
                onLongPress={() => {
                  if (!isCurrentUser) return;
                  Alert.alert("Delete message", "Are you sure you want to delete this message?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          // optimistic remove
                          setItems((prev) => prev.filter((m) => String(m.id) !== String(item.id)));
                          await messages.delete(item.id);
                        } catch (e) {
                          console.warn("[chat] delete error", (e as any)?.message || String(e));
                          // on failure re-load messages
                          const res = await messages.list({ user_id }).catch(() => ({ data: [] }));
                          const msgList = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
                          setItems((msgList || []).slice().reverse());
                        }
                      },
                    },
                  ]);
                }}
                style={[styles.messageBubbleTouchable]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                disabled={!isCurrentUser}
              >
                <View style={[styles.messageBubble, isCurrentUser ? styles.messageBubbleCurrentUser : styles.messageBubbleOtherUser, { alignSelf: isCurrentUser ? "flex-end" : "flex-start", maxWidth: BUBBLE_MAX_WIDTH }]}>
                  {!isCurrentUser &&
                    (item.sender?.avatar_path ? (
                      <Image source={{ uri: API_BASE_URL.replace(/\/api$/, "") + "/" + item.sender.avatar_path }} style={styles.otherUserAvatarImage} />
                    ) : (
                      <View style={styles.otherUserAvatar}>
                        <ThemedText style={styles.avatarText}>{item.sender?.name?.charAt(0) || "U"}</ThemedText>
                      </View>
                    ))}
                  <View style={[styles.messageContent, { maxWidth: BUBBLE_MAX_WIDTH - 20 }]}>
                    <Text style={[styles.messageText, isCurrentUser ? styles.messageTextCurrentUser : styles.messageTextOtherUser, { color: isCurrentUser ? "#ffffff" : "#000000", textAlign: isCurrentUser ? "right" : "left" }]}>
                      {item.content ?? item.message ?? "(no text)"}
                    </Text>
                    <Text style={[styles.messageTime, isCurrentUser ? styles.timeCurrentUser : styles.timeOtherUser, { color: isCurrentUser ? "rgba(255,255,255,0.8)" : "#555555" }]}>
                      {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              {isCurrentUser &&
                (currentUser?.avatar_path ? (
                  <Image source={{ uri: API_BASE_URL.replace(/\/api$/, "") + "/" + currentUser.avatar_path }} style={styles.currentUserAvatarImage} />
                ) : (
                  <View style={styles.currentUserAvatar}>
                    <ThemedText style={styles.avatarText}>{currentUser?.name?.charAt(0) || "U"}</ThemedText>
                  </View>
                ))}
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />

      {user_id ? (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput value={message} onChangeText={setMessage} placeholder="Message..." placeholderTextColor="#999" style={styles.input} multiline={true} maxLength={500} editable={true} scrollEnabled={true} />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!message.trim()}>
              <ThemedText style={styles.sendButtonText}>Send</ThemedText>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.noUserContainer}>
          <ThemedText style={styles.noUserText}>Select a user to message</ThemedText>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    gap: 12,
  },
  backButton: {
    fontSize: 16,
    color: "#0ea5a3",
    fontWeight: "600",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0ea5a3",
    alignItems: "center",
    justifyContent: "center",
  },
  callButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  messageWrapper: {
    marginVertical: 4,
    paddingHorizontal: 0,
    flexDirection: "row",
  },
  messageBubbleTouchable: {
    borderRadius: 18,
    paddingHorizontal: 0,
    paddingVertical: 2,
  },
  currentUserWrapper: {
    justifyContent: "flex-end",
    paddingRight: 0,
    marginRight: 0,
  },
  otherUserWrapper: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    minWidth: 28,
    maxWidth: "85%",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 6,
    // allow the bubble to shrink if needed and grow with content
    flexShrink: 1,
  },
  messageBubbleCurrentUser: {
    backgroundColor: "#0ea5a3",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 1,
    marginRight: 0,
    marginLeft: 0,
  },
  messageBubbleOtherUser: {
    backgroundColor: "#e8eaed",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 1,
    marginLeft: 0,
  },
  otherUserAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e0f2f1",
    alignItems: "center",
    justifyContent: "center",
  },
  otherUserAvatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
  },
  currentUserAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0ca597",
    alignItems: "center",
    justifyContent: "center",
  },
  currentUserAvatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 6,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  messageContent: {
    // Do not flex-grow: we want bubble width to be content-driven, so it expands horizontally
    minWidth: 20,
    maxWidth: "85%",
    paddingHorizontal: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    flexWrap: "wrap",
    // ensure the text doesn't shrink unexpectedly; let the container grow up to maxWidth
    flexShrink: 0,
  },
  messageTextCurrentUser: {
    color: "#fff",
    fontWeight: "500",
  },
  messageTextOtherUser: {
    color: "#1f2937",
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  timeCurrentUser: {
    color: "#fff",
    opacity: 0.7,
  },
  timeOtherUser: {
    color: "#999",
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f9fafb",
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#0ea5a3",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  noUserContainer: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  noUserText: {
    color: "#999",
    fontSize: 14,
  },
});
