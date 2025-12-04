import React, { useEffect, useState } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity, Text, SafeAreaView, ScrollView } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useRouter } from "expo-router";
import { getToken, removeToken } from "../services/auth";
import { posts } from "../services/api";

export default function HomeScreen() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feed, setFeed] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      setLoggedIn(!!token);
    })();
  }, []);

  const loadFeed = async () => {
    try {
      const res = await posts.list();
      setFeed(res.data.data || res.data);
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <ThemedText type="title">🏡 Discover</ThemedText>
          <ThemedText type="default" style={styles.subtitle}>
            Find inspiring posts & connect
          </ThemedText>
        </View>

        <View style={styles.stepContainer}>
          <FlatList
            scrollEnabled={false}
            data={feed}
            keyExtractor={(p) => String(p.id)}
            refreshing={refreshing}
            onRefresh={onRefresh}
            renderItem={({ item }) => (
              <View style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.avatar}>{item.user?.name ? <Text style={styles.avatarText}>{item.user.name.charAt(0)}</Text> : <Text style={styles.avatarText}>U</Text>}</View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <ThemedText type="defaultSemiBold">{item.user?.name}</ThemedText>
                    <ThemedText type="default" style={{ fontSize: 12, color: "#999" }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <TouchableOpacity onPress={() => router.push(`/users/${item.user?.id}`)}>
                    <ThemedText type="default" style={{ color: "#0ea5a3", fontWeight: "600" }}>
                      View
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                <View style={{ paddingVertical: 8 }}>
                  {item.title && <ThemedText style={{ fontWeight: "700", fontSize: 16, marginBottom: 6 }}>{item.title}</ThemedText>}
                  <ThemedText style={{ lineHeight: 20 }}>{item.content}</ThemedText>
                  {item.video_url ? (
                    <View style={styles.mediaPlaceholder}>
                      <ThemedText>🎥 Video</ThemedText>
                    </View>
                  ) : null}
                  {item.course ? (
                    <View style={{ marginTop: 8, padding: 10, backgroundColor: "#eef2ff", borderRadius: 8, borderLeftWidth: 3, borderLeftColor: "#0ea5a3" }}>
                      <ThemedText type="defaultSemiBold" style={{ color: "#0ea5a3" }}>
                        📚 Course: {item.course.title}
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/conversation?user_id=${item.user?.id}`)}>
                    <ThemedText style={styles.actionButtonText}>💬 Message</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/posts/${item.id}`)}>
                    <ThemedText style={styles.actionButtonText}>👁️ Read</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>

        <View style={styles.stepContainer}>
          <ThemedText type="subtitle">🔗 Quick Navigation</ThemedText>
          <View style={styles.navGrid}>
            <TouchableOpacity style={styles.navCard} onPress={() => router.push("/explore")}>
              <ThemedText style={styles.navIcon}>🔍</ThemedText>
              <ThemedText style={styles.navLabel}>Explore</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navCard} onPress={() => router.push("/skills")}>
              <ThemedText style={styles.navIcon}>⭐</ThemedText>
              <ThemedText style={styles.navLabel}>Skills</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navCard} onPress={() => router.push("/posts/create")}>
              <ThemedText style={styles.navIcon}>📝</ThemedText>
              <ThemedText style={styles.navLabel}>New Post</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navCard} onPress={() => router.push("/chat")}>
              <ThemedText style={styles.navIcon}>💬</ThemedText>
              <ThemedText style={styles.navLabel}>Messages</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {loggedIn && (
          <View style={styles.stepContainer}>
            <TouchableOpacity
              onPress={async () => {
                await removeToken();
                setLoggedIn(false);
                router.replace("/auth/login");
              }}
              style={styles.logoutButton}
            >
              <ThemedText style={styles.logoutButtonText}>🚪 Logout</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7fafc" },
  titleContainer: { flexDirection: "column", alignItems: "flex-start", marginBottom: 16, marginHorizontal: 16, marginTop: 16 },
  subtitle: { marginTop: 4, fontSize: 14, color: "#666" },
  stepContainer: { marginBottom: 16, marginHorizontal: 16 },
  reactLogo: { height: 0, width: 0 },
  search: { borderWidth: 1, borderColor: "#eee", padding: 8, borderRadius: 6 },
  card: { padding: 12, backgroundColor: "#fff", borderRadius: 8, marginRight: 8 },
  postCard: { padding: 16, marginVertical: 8, backgroundColor: "#fff", borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 3 },
  postHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#0ea5a3", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700" },
  mediaPlaceholder: { height: 200, backgroundColor: "#eee", alignItems: "center", justifyContent: "center", borderRadius: 8, marginVertical: 8 },
  postActions: { flexDirection: "row", marginTop: 12, gap: 8 },
  actionButton: { flex: 1, paddingVertical: 10, backgroundColor: "#0ea5a3", borderRadius: 8, alignItems: "center" },
  actionButtonText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  navGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 },
  navCard: { flex: 1, minWidth: "48%", paddingVertical: 16, backgroundColor: "#fff", borderRadius: 12, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 1 },
  navIcon: { fontSize: 32, marginBottom: 6 },
  navLabel: { fontSize: 12, fontWeight: "600", color: "#333" },
  logoutButton: { paddingVertical: 12, backgroundColor: "#fee2e2", borderRadius: 8, alignItems: "center" },
  logoutButtonText: { color: "#b91c1c", fontWeight: "600" },
});
