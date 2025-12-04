import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, Image, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { auth } from "../../services/api";
import { ThemedText } from "@/components/themed-text";

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
      Alert.alert("Success", "Profile picture updated");
      setSelectedImage(null);
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to upload picture");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Change Profile Picture</ThemedText>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholder}>
              <ThemedText style={styles.placeholderText}>📷</ThemedText>
              <ThemedText style={styles.placeholderLabel}>No image selected</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.button} onPress={pickImage} disabled={uploading}>
            <ThemedText style={styles.buttonText}>📂 Choose from Gallery</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={takePhoto} disabled={uploading}>
            <ThemedText style={styles.buttonText}>📸 Take a Photo</ThemedText>
          </TouchableOpacity>
        </View>

        {selectedImage && (
          <View style={styles.actionGroup}>
            <TouchableOpacity style={[styles.uploadButton, uploading && styles.buttonDisabled]} onPress={handleUpload} disabled={uploading}>
              <ThemedText style={styles.uploadButtonText}>{uploading ? "Uploading..." : "✓ Upload Picture"}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedImage(null)} disabled={uploading}>
              <ThemedText style={styles.cancelButtonText}>✗ Cancel</ThemedText>
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
    backgroundColor: "#f7fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    fontSize: 16,
    color: "#0ea5a3",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
    marginBottom: 24,
    alignItems: "center",
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  placeholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 60,
    marginBottom: 8,
  },
  placeholderLabel: {
    fontSize: 14,
    color: "#999",
  },
  buttonGroup: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#0ea5a3",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#0ea5a3",
    fontWeight: "600",
    fontSize: 14,
  },
  actionGroup: {
    gap: 12,
  },
  uploadButton: {
    backgroundColor: "#0ea5a3",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#fee2e2",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#b91c1c",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
