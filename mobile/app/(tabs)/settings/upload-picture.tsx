import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { auth } from "../../services/api";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

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
    <ParallaxScrollView headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }} headerImage={<View />}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.backButton}>← Back</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title">Change Profile Picture</ThemedText>
        </View>

        <ThemedView style={styles.card}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholder}>
              <ThemedText style={styles.placeholderText}>📷</ThemedText>
              <ThemedText style={styles.placeholderLabel}>No image selected</ThemedText>
            </View>
          )}
        </ThemedView>

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
    paddingVertical: 12,
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
    paddingVertical: 12,
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
    paddingVertical: 12,
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
