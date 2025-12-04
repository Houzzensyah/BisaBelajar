import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Button, TextInput, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usersApi, posts, auth, callsApi } from "../services/api";
import { getToken } from "../services/auth";

export default function UserProfile() {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const res = await usersApi.get(Number(id));
        const token = await getToken();
        if (token) {
          try {
            const meRes = await auth.me();
            setMe(meRes.data);
          } catch {
            /* ignore */
          }
        }
        setUser(res.data);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading)
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  if (!user)
    return (
      <View style={styles.container}>
        <Text>User not found</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.name}>{user.name}</Text>
      {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
      {user.specialties?.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
          {user.specialties.map((s: any) => (
            <View key={s.id} style={[styles.skillChip, { backgroundColor: "#eef2ff" }]}>
              <Text>{s.name}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <Button title="Message" onPress={() => router.push(`/conversation?user_id=${user.id}`)} />
      <Button
        title="Call"
        onPress={async () => {
          try {
            const res = await callsApi.create({ callee_id: Number(id) });
            // push to calls dynamic route
            router.push({ pathname: "/calls/[id]", params: { id: String(res.data.id) } } as any);
          } catch (e) {
            console.warn(e);
          }
        }}
      />

      <View style={{ marginTop: 12 }}>
        {me && me.id === user.id ? (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: "700" }}>Create Post</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder="Title" style={{ borderWidth: 1, borderColor: "#eee", padding: 8, borderRadius: 6, marginTop: 8 }} />
            <TextInput value={content} onChangeText={setContent} placeholder="Content" multiline style={{ borderWidth: 1, borderColor: "#eee", padding: 8, borderRadius: 6, marginTop: 8, minHeight: 80 }} />
            <View style={{ marginTop: 8 }}>
              <Text style={{ marginBottom: 6 }}>Attach course (optional)</Text>
              <View style={{ flexDirection: "row" }}>
                {user.courses?.map((c: any) => (
                  <TouchableOpacity key={c.id} onPress={() => setSelectedCourse(selectedCourse === c.id ? null : c.id)} style={{ padding: 6, borderRadius: 6, backgroundColor: selectedCourse === c.id ? "#0ea5a3" : "#fff" }}>
                    <Text style={{ color: selectedCourse === c.id ? "#fff" : "#000" }}>{c.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Button
              title="Create"
              onPress={async () => {
                try {
                  const payload: any = { title, content };
                  if (selectedCourse) payload.course_id = selectedCourse;
                  const res = await posts.create(payload);
                  setUser({ ...user, posts: [...(user.posts || []), res.data] });
                  setTitle("");
                  setContent("");
                } catch (err) {
                  console.warn(err);
                }
              }}
            />
          </View>
        ) : null}
        <Text style={styles.sectionTitle}>Specialist</Text>
        {user.skills?.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {user.skills.map((s: any) => (
              <View key={s.id} style={styles.skillChip}>
                <Text>{s.name}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text>No skills listed.</Text>
        )}
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={styles.sectionTitle}>Courses</Text>
        {user.courses?.length ? (
          user.courses.map((c: any) => (
            <View key={c.id} style={styles.row}>
              <Text>{c.title}</Text>
            </View>
          ))
        ) : (
          <Text>No courses.</Text>
        )}
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={styles.sectionTitle}>Posts</Text>
        {user.posts?.length ? (
          user.posts.map((p: any) => (
            <View key={p.id} style={styles.post}>
              <Text style={styles.postTitle}>{p.title || "(No title)"}</Text>
              <Text numberOfLines={3}>{p.content}</Text>
              <Button title="View" onPress={() => router.push(`/posts/${p.id}`)} />
            </View>
          ))
        ) : (
          <Text>No posts.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7fafc" },
  name: { fontSize: 24, fontWeight: "700", marginBottom: 6 },
  bio: { color: "#444", marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  row: { paddingVertical: 8 },
  post: { paddingVertical: 8 },
  postTitle: { fontWeight: "600" },
  skillChip: { backgroundColor: "#fff", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, marginRight: 8, marginBottom: 4 },
});
