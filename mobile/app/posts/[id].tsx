import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { posts } from "../services/api";

export default function PostDetail() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const res = await posts.show(Number(id));
        setPost(res.data);
      } catch (err) {
        console.warn(err);
      }
    })();
  }, [id]);

  if (!post)
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.card}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.author}>By {post.user?.name}</Text>
        <Text style={styles.content}>{post.content}</Text>
        {post.video_url ? <Text style={{ marginTop: 10 }}>Video: {post.video_url}</Text> : null}
        {post.course ? (
          <View style={{ marginTop: 10, padding: 8, backgroundColor: "#eef2ff", borderRadius: 6 }}>
            <Text style={{ fontWeight: "600" }}>Course: {post.course.title}</Text>
          </View>
        ) : null}
        <View style={{ marginTop: 12 }}>
          <Button title="Message author" onPress={() => router.push(`/conversation?user_id=${post.user.id}`)} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7fafc" },
  card: { backgroundColor: "#fff", padding: 20, borderRadius: 8 },
  title: { fontSize: 24, fontWeight: "700" },
  author: { color: "#999", marginTop: 6 },
  content: { marginTop: 12 },
});
