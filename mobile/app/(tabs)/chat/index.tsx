import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView, View, FlatList, StyleSheet, TouchableOpacity, Image, Text, RefreshControl } from "react-native";
import { usersApi, messages, auth, API_BASE_URL } from "../../services/api";
import { useRouter, useFocusEffect } from "expo-router";
import { ThemedText } from "@/components/themed-text";

export default function ChatListScreen() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  const loadConversations = useCallback(async () => {
    try {
      const userRes = await auth.me();
      setCurrentUser(userRes.data);

      // Get all messages involving current user
      const res = await messages.list({});
      const allMessages = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];

      // Group messages by conversation partner (or self)
      const conversationMap = new Map();

      allMessages.forEach((msg: any) => {
        const isSender = msg.sender_id === userRes.data.id;
        const isReceiver = msg.receiver_id === userRes.data.id;

        // Self-chat: when both sender and receiver are the current user
        if (isSender && isReceiver) {
          const partnerId = userRes.data.id;
          const key = `self-${partnerId}`;

          if (!conversationMap.has(key) || new Date(msg.created_at) > new Date(conversationMap.get(key).created_at)) {
            conversationMap.set(key, {
              ...msg,
              partner: userRes.data,
              partnerId: userRes.data.id,
              isSelf: true,
            });
          }
        }
        // Regular chat: messages with other users
        else if (isSender || isReceiver) {
          const partnerId = isSender ? msg.receiver_id : msg.sender_id;
          const partner = isSender ? msg.receiver : msg.sender;
          const key = `user-${partnerId}`;

          if (!conversationMap.has(key) || new Date(msg.created_at) > new Date(conversationMap.get(key).created_at)) {
            conversationMap.set(key, {
              ...msg,
              partner,
              partnerId,
              isSelf: false,
            });
          }
        }
      });

      // Convert to array and sort by most recent
      const convos = Array.from(conversationMap.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setConversations(convos);
    } catch (err: any) {
      console.warn(err);
      if (err?.response?.status === 401) router.replace("/auth/login");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations();
  }, [loadConversations]);

  const handleStartSelfChat = () => {
    if (currentUser?.id) {
      router.push(`/chat?user_id=${currentUser.id}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
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
        <ThemedText type="title" style={styles.headerTitle}>
          Messages
        </ThemedText>
        <TouchableOpacity style={styles.selfChatButton} onPress={handleStartSelfChat}>
          <Text style={styles.selfChatIcon}>📝</Text>
        </TouchableOpacity>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <ThemedText style={styles.emptyText}>No messages yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>Start a conversation with someone!</ThemedText>
          <TouchableOpacity style={styles.selfChatPrompt} onPress={handleStartSelfChat}>
            <ThemedText style={styles.selfChatPromptText}>Or create notes to yourself</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => (item.isSelf ? `self-${item.partnerId}` : `user-${item.partnerId}`)}
          renderItem={({ item }) => {
            const isSender = item.sender_id === currentUser?.id;
            const preview = item.content?.substring(0, 60) + (item.content?.length > 60 ? "..." : "");
            const displayName = item.isSelf ? "Notes to myself" : item.partner?.name || "Unknown";

            return (
              <TouchableOpacity style={styles.conversationItem} onPress={() => router.push(`/chat?user_id=${item.partnerId}`)}>
                {item.partner?.avatar_path ? (
                  <Image source={{ uri: API_BASE_URL.replace(/\/api$/, "") + "/" + item.partner.avatar_path }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, item.isSelf ? styles.selfAvatar : styles.defaultAvatar]}>
                    <ThemedText style={styles.avatarText}>{item.isSelf ? "📝" : item.partner?.name?.charAt(0) || "U"}</ThemedText>
                  </View>
                )}

                <View style={styles.conversationInfo}>
                  <View style={styles.conversationHeader}>
                    <ThemedText style={styles.partnerName}>{displayName}</ThemedText>
                    <ThemedText style={styles.timestamp}>{new Date(item.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}</ThemedText>
                  </View>
                  <ThemedText style={styles.messagePreview} numberOfLines={1}>
                    {isSender && !item.isSelf ? "You: " : ""}
                    {preview}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            );
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  selfChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0ea5a3",
    alignItems: "center",
    justifyContent: "center",
  },
  selfChatIcon: {
    fontSize: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 16,
  },
  selfChatPrompt: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#0ea5a3",
    borderRadius: 20,
    marginTop: 8,
  },
  selfChatPromptText: {
    color: "#fff",
    fontWeight: "600",
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  defaultAvatar: {
    backgroundColor: "#e0f2f1",
  },
  selfAvatar: {
    backgroundColor: "#fff3cd",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  messagePreview: {
    fontSize: 14,
    color: "#666",
  },
});
