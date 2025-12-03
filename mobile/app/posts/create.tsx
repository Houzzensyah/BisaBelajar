import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { posts, courses } from "../services/api";
import { getToken } from "../services/auth";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function CreatePostScreen() {
  const [formData, setFormData] = useState({ title: "", content: "", course_id: null });
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [posting, setPosting] = useState(false);
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const router = useRouter();

  const loadCourses = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.replace("/auth/login");
        return;
      }
      const res = await courses.list();
      setCoursesList(res.data.data || res.data || []);
    } catch (err) {
      console.warn(err);
    }
  }, [router]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

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

  const handlePost = async () => {
    if (!formData.content.trim()) {
      Alert.alert("Error", "Post content is required");
      return;
    }

    setPosting(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("title", formData.title || "");
      formDataObj.append("content", formData.content);
      if (formData.course_id) {
        formDataObj.append("course_id", formData.course_id);
      }
      if (selectedPhoto) {
        formDataObj.append("photo", {
          uri: selectedPhoto.uri,
          type: selectedPhoto.mimeType || "image/jpeg",
          name: selectedPhoto.fileName || "photo.jpg",
        } as any);
      }

      await posts.create(formDataObj);
      Alert.alert("Success", "Post created successfully!");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  const selectedCourse = coursesList.find((c) => c.id === formData.course_id);

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }} headerImage={<View />}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.backButton}>← Back</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title">Create Post</ThemedText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.form}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Title (Optional)</ThemedText>
              <TextInput style={styles.input} placeholder="Give your post a title..." value={formData.title} onChangeText={(text) => setFormData({ ...formData, title: text })} placeholderTextColor="#999" />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Content *</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Share your thoughts, tips, or experiences..."
                value={formData.content}
                onChangeText={(text) => setFormData({ ...formData, content: text })}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
              <ThemedText style={styles.characterCount}>{formData.content.length}/5000</ThemedText>
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

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Related Course (Optional)</ThemedText>
              <TouchableOpacity style={styles.courseSelector} onPress={() => setShowCoursePicker(!showCoursePicker)}>
                <ThemedText style={styles.courseSelectorText}>{selectedCourse ? `📚 ${selectedCourse.title}` : "Select a course..."}</ThemedText>
              </TouchableOpacity>

              {showCoursePicker && coursesList.length > 0 && (
                <View style={styles.coursePicker}>
                  <TouchableOpacity
                    style={styles.courseOption}
                    onPress={() => {
                      setFormData({ ...formData, course_id: null });
                      setShowCoursePicker(false);
                    }}
                  >
                    <ThemedText style={styles.courseOptionText}>None</ThemedText>
                  </TouchableOpacity>
                  {coursesList.map((course: any) => (
                    <TouchableOpacity
                      key={course.id}
                      style={[styles.courseOption, formData.course_id === course.id && styles.courseOptionSelected]}
                      onPress={() => {
                        setFormData({ ...formData, course_id: course.id });
                        setShowCoursePicker(false);
                      }}
                    >
                      <ThemedText style={[styles.courseOptionText, formData.course_id === course.id && styles.courseOptionTextSelected]}>📚 {course.title}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity style={[styles.postButton, posting && styles.postButtonDisabled]} onPress={handlePost} disabled={posting}>
              <ThemedText style={styles.postButtonText}>{posting ? "Publishing..." : "📤 Publish Post"}</ThemedText>
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
    marginBottom: 24,
    gap: 12,
  },
  backButton: {
    fontSize: 16,
    color: "#0ea5a3",
    fontWeight: "600",
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
    height: 120,
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    textAlign: "right",
  },
  courseSelector: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9fafb",
  },
  courseSelectorText: {
    fontSize: 14,
    color: "#333",
  },
  coursePicker: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 200,
    backgroundColor: "#fff",
  },
  courseOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  courseOptionSelected: {
    backgroundColor: "#eef2ff",
  },
  courseOptionText: {
    fontSize: 14,
    color: "#333",
  },
  courseOptionTextSelected: {
    color: "#0ea5a3",
    fontWeight: "600",
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
