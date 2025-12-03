import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { courses } from "../services/api";
import { useRouter } from "expo-router";

export default function CoursesScreen() {
  const [items, setItems] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await courses.list();
        setItems(res.data.data || res.data);
      } catch (err: any) {
        console.warn(err);
        if (err?.response?.status === 401) router.replace("/auth/login");
      }
    })();
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Courses</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => {
          return (
            <View style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.title}>{item.title}</Text>
                <TouchableOpacity style={styles.enrollButton} onPress={() => console.log("Enroll", item.id)}>
                  <Text style={styles.enrollText}>Enroll</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.subtitle}>By {item.owner?.name}</Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f7fafc" },
  item: { padding: 16, marginBottom: 12, backgroundColor: "#fff", borderRadius: 8 },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "600" },
  subtitle: { color: "#999", marginTop: 4 },
  enrollButton: { backgroundColor: "#0ea5a3", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  enrollText: { color: "#fff", fontWeight: "600" },
  header: { paddingVertical: 12, alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700" },
});
