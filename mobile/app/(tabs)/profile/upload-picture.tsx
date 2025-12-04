import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, Image, SafeAreaView, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { auth } from "../../services/api";

export default function UploadPictureScreen() {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
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
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
      }
    } catch {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert("Error", "Please select an image first");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", {
        uri: selectedImage.uri,
        type: selectedImage.mimeType || "image/jpeg",
        name: selectedImage.fileName || "avatar.jpg",
      } as any);

      await auth.uploadProfilePicture(formData);
      Alert.alert("Success", "Profile picture updated successfully!");
      setSelectedImage(null);
      // Navigate back to profile to refresh
      setTimeout(() => router.back(), 500);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to upload picture");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Picture</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          {selectedImage ? (
            <>
              <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
              <Text style={styles.selectedLabel}>✓ Image Selected</Text>
            </>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>📷</Text>
              <Text style={styles.placeholderLabel}>No image selected</Text>
              <Text style={styles.placeholderHint}>Choose from gallery or take a photo</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.button} onPress={pickImage} disabled={uploading}>
            <Text style={styles.buttonText}>📂 Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={takePhoto} disabled={uploading}>
            <Text style={styles.buttonText}>📸 Camera</Text>
          </TouchableOpacity>
        </View>

        {selectedImage && (
          <View style={styles.actionGroup}>
            <TouchableOpacity style={[styles.uploadButton, uploading && styles.buttonDisabled]} onPress={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
                  <Text style={styles.uploadButtonText}>Uploading...</Text>
                </>
              ) : (
                <Text style={styles.uploadButtonText}>✓ Upload</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedImage(null)} disabled={uploading}>
              <Text style={styles.cancelButtonText}>✗ Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    fontSize: 22,
    color: "#0ea5e9",
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.3,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
    alignItems: "center",
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 12,
  },
  selectedLabel: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "700",
  },
  placeholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 60,
    marginBottom: 8,
  },
  placeholderLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  placeholderHint: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  buttonGroup: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#0ea5e9",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonText: {
    color: "#0ea5e9",
    fontWeight: "700",
    fontSize: 15,
  },
  actionGroup: {
    gap: 12,
  },
  uploadButton: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  cancelButton: {
    backgroundColor: "#fee2e2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#b91c1c",
    fontWeight: "700",
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
