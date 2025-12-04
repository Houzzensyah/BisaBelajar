import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView, View, FlatList, StyleSheet, TouchableOpacity, Image, Text, RefreshControl } from "react-native";
import { usersApi, messages, auth, API_BASE_URL } from "../../services/api";
import { useRouter, useFocusEffect } from "expo-router";

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
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.selfChatButton} onPress={handleStartSelfChat}>
          <Text style={styles.selfChatIcon}>📝</Text>
        </TouchableOpacity>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Start a conversation with someone!</Text>
          <TouchableOpacity style={styles.selfChatPrompt} onPress={handleStartSelfChat}>
            <Text style={styles.selfChatPromptText}>Or create notes to yourself</Text>
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
                    <Text style={styles.avatarText}>{item.isSelf ? "📝" : item.partner?.name?.charAt(0) || "U"}</Text>
                  </View>
                )}

                <View style={styles.conversationInfo}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.partnerName}>{displayName}</Text>
                    <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}</Text>
                  </View>
                  <Text style={styles.messagePreview} numberOfLines={1}>
                    {isSender && !item.isSelf ? "You: " : ""}
                    {preview}
                  </Text>
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
    backgroundColor: "#f5f7fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
  },
  selfChatButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 72,
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    color: "#111827",
  },
  emptySubtext: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  selfChatPrompt: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: "#0ea5e9",
    borderRadius: 24,
    marginTop: 8,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  selfChatPromptText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  defaultAvatar: {
    backgroundColor: "#dbeafe",
  },
  selfAvatar: {
    backgroundColor: "#fef3c7",
  },
  avatarText: {
    fontSize: 22,
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
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.3,
  },
  timestamp: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500",
  },
  messagePreview: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
});
