import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, ScrollView } from "react-native";
import { skills } from "../services/api";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function SkillDetail() {
  const { id } = useLocalSearchParams();
  const [skill, setSkill] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const res = await skills.get(Number(id));
        setSkill(res.data);
      } catch (err) {
        console.warn(err);
        if (err?.response?.status === 401) {
          router.replace("/auth/login");
        }
      }
    })();
  }, [id, router]);

  if (!skill) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.card}>
        <Text style={styles.title}>{skill.name}</Text>
        <Text style={styles.category}>{skill.category}</Text>
        <Text style={styles.desc}>{skill.description}</Text>
        <View style={{ marginTop: 12 }}>
          <Button title="Back" onPress={() => router.back()} />
          <View style={{ marginTop: 8 }}>
            <Button title="Message owner" onPress={() => router.push(`/chat?user_id=${skill.user.id}`)} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7fafc" },
  card: { backgroundColor: "#fff", padding: 20, borderRadius: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, elevation: 2 },
  title: { fontSize: 22, fontWeight: "700" },
  desc: { marginTop: 12, color: "#555" },
  category: { color: "#0ea5a3", marginTop: 4 },
});
