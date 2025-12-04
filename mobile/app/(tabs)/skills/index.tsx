import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from "react-native";
import { skills, Skill } from "../../services/api";
import { useRouter } from "expo-router";

export default function SkillsScreen() {
  const [items, setItems] = useState<Skill[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await skills.list();
        setItems(res.data.data || res.data);
      } catch (err: any) {
        console.warn(err);
        const msg = err?.response?.data?.message || "Unable to load skills.";
        setError(msg);
        if (err?.response?.status === 401) {
          router.replace("/auth/login");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Skills</Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <Text style={styles.loading}>Loading…</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => router.push(`/skills/${item.id}`)}>
            <View style={styles.itemHeader}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>
            {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
            <Text style={styles.meta}>By {item.user?.name || `#${item.user_id}`}</Text>
            <Text style={styles.meta}>
              <Text style={{ color: "#0ea5a3" }} onPress={() => router.push(`/users/${item.user_id}`)}>
                View profile
              </Text>{" "}
              ·{" "}
              <Text style={{ color: "#0ea5a3" }} onPress={() => router.push(`/conversation?user_id=${item.user_id}`)}>
                Chat
              </Text>
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f7fafc" },
  item: { padding: 16, marginBottom: 12, backgroundColor: "#fff", borderRadius: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, elevation: 2 },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "600" },
  category: { color: "#0ea5a3", fontSize: 12 },
  desc: { marginTop: 8, color: "#555" },
  meta: { marginTop: 8, color: "#999", fontSize: 12 },
  header: { paddingVertical: 12, alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  loading: { color: "#666", alignSelf: "center", marginTop: 16 },
  error: { color: "#b91c1c", alignSelf: "center", marginTop: 16 },
});
