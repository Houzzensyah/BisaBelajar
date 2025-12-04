import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Image, SafeAreaView, ActivityIndicator, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { posts } from "../services/api";
import { getToken } from "../services/auth";

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
      formDataObj.append("thread_id", String(thread_id || ""));

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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Loading thread...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reply to Thread</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Original Thread Preview */}
        {thread && (
          <View style={styles.threadPreview}>
            <View style={styles.threadHeader}>
              <View style={styles.threadAvatar}>
                <Text style={styles.threadAvatarText}>{thread.user?.name?.charAt(0) || "U"}</Text>
              </View>
              <View style={styles.threadUserDetails}>
                <Text style={styles.threadUserName}>{thread.user?.name}</Text>
                <Text style={styles.threadDate}>{new Date(thread.created_at).toLocaleDateString()}</Text>
              </View>
            </View>
            {thread.title && <Text style={styles.threadTitle}>{thread.title}</Text>}
            <Text style={styles.threadContent}>{thread.content}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Your Reply *</Text>
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
            <Text style={styles.characterCount}>{content.length}/5000</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Add Photo (Optional)</Text>
            {selectedPhoto ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: selectedPhoto.uri }} style={styles.photoPreview} />
                <TouchableOpacity style={styles.removePhotoButton} onPress={() => setSelectedPhoto(null)}>
                  <Text style={styles.removePhotoText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoButtonGroup}>
                <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                  <Text style={styles.photoButtonText}>📁 Choose Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                  <Text style={styles.photoButtonText}>📷 Take Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity style={[styles.postButton, posting && styles.postButtonDisabled]} onPress={handleReply} disabled={posting}>
            {posting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.postButtonText}>📤 Post Reply</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButtonContainer: {
    padding: 8,
    marginHorizontal: -8,
  },
  backButton: {
    fontSize: 16,
    color: "#0ea5e9",
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  threadPreview: {
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: "#0ea5e9",
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
    backgroundColor: "#0ea5e9",
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
    color: "#9ca3af",
    marginTop: 2,
  },
  threadTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1f2937",
  },
  threadContent: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 19,
  },
  form: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 12,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#f9fafb",
    color: "#1f2937",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
    textAlign: "right",
  },
  postButton: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
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
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 16,
  },
  photoButtonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  photoButton: {
    flex: 1,
    backgroundColor: "#eff6ff",
    borderWidth: 2,
    borderColor: "#0ea5e9",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  photoButtonText: {
    color: "#0ea5e9",
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
    backgroundColor: "#f3f4f6",
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
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  removePhotoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
