import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Image, SafeAreaView, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { posts, courses } from "../services/api";
import { getToken } from "../services/auth";

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
        formDataObj.append("course_id", String(formData.course_id));
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Post</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title (Optional)</Text>
            <TextInput style={styles.input} placeholder="Give your post a title..." value={formData.title} onChangeText={(text) => setFormData({ ...formData, title: text })} placeholderTextColor="#999" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Content *</Text>
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
            <Text style={styles.characterCount}>{formData.content.length}/5000</Text>
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Related Course (Optional)</Text>
            <TouchableOpacity style={styles.courseSelector} onPress={() => setShowCoursePicker(!showCoursePicker)}>
              <Text style={styles.courseSelectorText}>{selectedCourse ? `📚 ${selectedCourse.title}` : "Select a course..."}</Text>
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
                  <Text style={styles.courseOptionText}>None</Text>
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
                    <Text style={[styles.courseOptionText, formData.course_id === course.id && styles.courseOptionTextSelected]}>📚 {course.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity style={[styles.postButton, posting && styles.postButtonDisabled]} onPress={handlePost} disabled={posting}>
            {posting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.postButtonText}>📤 Publish Post</Text>}
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
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
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
  scrollView: {
    flex: 1,
  },
  form: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 12,
    borderRadius: 12,
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
    height: 120,
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
    textAlign: "right",
  },
  courseSelector: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9fafb",
  },
  courseSelectorText: {
    fontSize: 14,
    color: "#1f2937",
  },
  coursePicker: {
    borderWidth: 1,
    borderColor: "#d1d5db",
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
    backgroundColor: "#eff6ff",
  },
  courseOptionText: {
    fontSize: 14,
    color: "#1f2937",
  },
  courseOptionTextSelected: {
    color: "#0ea5e9",
    fontWeight: "600",
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
