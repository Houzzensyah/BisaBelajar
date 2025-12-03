import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { posts } from "../services/api";
import { getToken } from "../services/auth";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function ReplyScreen() {
  const [content, setContent] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [posting, setPosting] = useState(false);
  const [thread, setThread] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { thread_id } = useLocalSearchParams();

  const loadThread = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.replace("/auth/login");
        return;
      }
      if (thread_id) {
        const res = await posts.show(Number(thread_id));
        setThread(res.data);
      }
    } catch (err) {
      console.warn(err);
      Alert.alert("Error", "Failed to load thread");
    } finally {
      setLoading(false);
    }
  }, [thread_id, router]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedPhoto(result.assets[0]);
      }
    } catch {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Camera permission is required");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedPhoto(result.assets[0]);
      }
    } catch {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const handleReply = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Reply content is required");
      return;
    }

    setPosting(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("content", content);
      formDataObj.append("thread_id", thread_id || "");

      if (selectedPhoto) {
        formDataObj.append("photo", {
          uri: selectedPhoto.uri,
          type: selectedPhoto.mimeType || "image/jpeg",
          name: selectedPhoto.fileName || "photo.jpg",
        } as any);
      }

      await posts.create(formDataObj);
      Alert.alert("Success", "Reply posted successfully!");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to post reply");
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <ParallaxScrollView headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }} headerImage={<View />}>
        <ThemedView style={styles.container}>
          <ThemedText>Loading thread...</ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }} headerImage={<View />}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.backButton}>← Back</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title">Reply to Thread</ThemedText>
        </View>

        {/* Original Thread Preview */}
        {thread && (
          <View style={styles.threadPreview}>
            <View style={styles.threadHeader}>
              <View style={styles.threadAvatar}>
                <ThemedText style={styles.threadAvatarText}>{thread.user?.name?.charAt(0) || "U"}</ThemedText>
              </View>
              <View style={styles.threadUserDetails}>
                <ThemedText style={styles.threadUserName}>{thread.user?.name}</ThemedText>
                <ThemedText style={styles.threadDate}>{new Date(thread.created_at).toLocaleDateString()}</ThemedText>
              </View>
            </View>
            {thread.title && <ThemedText style={styles.threadTitle}>{thread.title}</ThemedText>}
            <ThemedText style={styles.threadContent}>{thread.content}</ThemedText>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.form}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Your Reply *</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Share your thoughts about this thread..."
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
              <ThemedText style={styles.characterCount}>{content.length}/5000</ThemedText>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Add Photo (Optional)</ThemedText>
              {selectedPhoto ? (
                <View style={styles.photoPreviewContainer}>
                  <Image source={{ uri: selectedPhoto.uri }} style={styles.photoPreview} />
                  <TouchableOpacity style={styles.removePhotoButton} onPress={() => setSelectedPhoto(null)}>
                    <ThemedText style={styles.removePhotoText}>✕</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.photoButtonGroup}>
                  <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                    <ThemedText style={styles.photoButtonText}>📁 Choose Photo</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                    <ThemedText style={styles.photoButtonText}>📷 Take Photo</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity style={[styles.postButton, posting && styles.postButtonDisabled]} onPress={handleReply} disabled={posting}>
              <ThemedText style={styles.postButtonText}>{posting ? "Posting..." : "📤 Post Reply"}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f7fafc", minHeight: "100%" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  backButton: {
    fontSize: 16,
    color: "#0ea5a3",
    fontWeight: "600",
  },
  threadPreview: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 1,
    borderLeftWidth: 3,
    borderLeftColor: "#0ea5a3",
  },
  threadHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  threadAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0ea5a3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  threadAvatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  threadUserDetails: {
    flex: 1,
  },
  threadUserName: {
    fontWeight: "600",
    fontSize: 13,
    color: "#1f2937",
  },
  threadDate: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  threadTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  threadContent: {
    fontSize: 13,
    color: "#666",
    lineHeight: 19,
  },
  form: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#f9fafb",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    textAlign: "right",
  },
  postButton: {
    backgroundColor: "#0ea5a3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
  photoButtonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  photoButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#0ea5a3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  photoButtonText: {
    color: "#0ea5a3",
    fontWeight: "600",
    fontSize: 13,
  },
  photoPreviewContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  photoPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removePhotoButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#b91c1c",
    alignItems: "center",
    justifyContent: "center",
  },
  removePhotoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
