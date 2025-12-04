import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, SafeAreaView, ScrollView } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { auth, API_BASE_URL } from "../../services/api";
import { getToken, removeToken } from "../../services/auth";
import { ThemedText } from "@/components/themed-text";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadProfile = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.replace("/auth/login");
        return;
      }
      const res = await auth.me();
      setUser(res.data);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await removeToken();
          router.replace("/auth/login");
        },
        style: "destructive",
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>No user found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          {user.avatar_path ? (
            <Image source={{ uri: API_BASE_URL.replace(/\/api$/, "") + "/" + user.avatar_path }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name?.charAt(0) || "U"}</Text>
            </View>
          )}
          <ThemedText style={styles.name}>{user.name}</ThemedText>
          <ThemedText style={styles.email}>{user.email}</ThemedText>
        </View>

        {user.bio && (
          <View style={styles.section}>
            <ThemedText type="subtitle">About</ThemedText>
            <ThemedText style={styles.bio}>{user.bio}</ThemedText>
          </View>
        )}

        {user.specialties?.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle">Specialties</ThemedText>
            <View style={styles.chipContainer}>
              {user.specialties.map((s: any) => (
                <View key={s.id} style={styles.chip}>
                  <ThemedText style={styles.chipText}>{s.name}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {user.skills?.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle">Skills ({user.skills.length})</ThemedText>
            <View style={styles.listContainer}>
              {user.skills.slice(0, 5).map((s: any) => (
                <View key={s.id} style={styles.listItem}>
                  <ThemedText>{s.name}</ThemedText>
                  {s.category && <ThemedText style={styles.category}>{s.category}</ThemedText>}
                </View>
              ))}
            </View>
          </View>
        )}

        {user.courses?.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle">Courses ({user.courses.length})</ThemedText>
            <View style={styles.listContainer}>
              {user.courses.slice(0, 5).map((c: any) => (
                <View key={c.id} style={styles.listItem}>
                  <ThemedText>{c.title}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {user.posts?.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle">Posts ({user.posts.length})</ThemedText>
            <View style={styles.listContainer}>
              {user.posts.slice(0, 3).map((p: any) => (
                <TouchableOpacity key={p.id} style={styles.postItem} onPress={() => router.push(`/posts/${p.id}`)}>
                  <ThemedText style={{ fontWeight: "600" }}>{p.title || "(No title)"}</ThemedText>
                  <ThemedText numberOfLines={2} style={styles.postContent}>
                    {p.content}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <ThemedText type="subtitle">Quick Actions</ThemedText>
          <View style={styles.settingsList}>
            <TouchableOpacity style={styles.settingsItem} onPress={() => router.push("/posts/create")}>
              <ThemedText>📝 Create a Post</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsItem} onPress={() => router.push("/(tabs)/posts")}>
              <ThemedText>📱 View All Posts</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingsItem, styles.logoutItem]} onPress={handleLogout}>
              <ThemedText style={styles.logoutText}>🚪 Logout</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">Profile Settings</ThemedText>
          <View style={styles.settingsList}>
            <TouchableOpacity style={styles.settingsItem} onPress={() => router.push("/(tabs)/profile/edit-profile")}>
              <ThemedText>✏️ Edit Profile</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsItem} onPress={() => router.push("/(tabs)/profile/upload-picture")}>
              <ThemedText>📷 Change Profile Picture</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>BisaBelajar v1.0.0</ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7fafc" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    marginTop: 16,
    marginHorizontal: 16,
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0ea5a3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 32,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 1,
  },
  bio: {
    marginTop: 8,
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },
  chip: {
    backgroundColor: "#eef2ff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 12,
    color: "#0ea5a3",
    fontWeight: "600",
  },
  listContainer: {
    marginTop: 8,
  },
  listItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  category: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  postItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#0ea5a3",
  },
  postContent: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  settingsList: {
    marginTop: 8,
  },
  settingsItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  logoutItem: {
    backgroundColor: "#fee2e2",
  },
  logoutText: {
    color: "#b91c1c",
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerText: {
    fontSize: 12,
    color: "#999",
  },
});
