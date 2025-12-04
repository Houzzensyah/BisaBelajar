import React, { useCallback, useState } from "react";
import { View, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, SafeAreaView } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { auth } from "../../services/api";
import { getToken } from "../../services/auth";
import { ThemedText } from "@/components/themed-text";

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", bio: "" });
  const router = useRouter();

  const loadProfile = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.replace("/auth/login");
        return;
      }
      const res = await auth.me();
      setFormData({
        name: res.data.name || "",
        email: res.data.email || "",
        bio: res.data.bio || "",
      });
    } catch (err) {
      console.warn(err);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    setSaving(true);
    try {
      await auth.updateProfile({
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
      });

      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Edit Profile</ThemedText>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Name *</ThemedText>
            <TextInput style={styles.input} placeholder="Your name" value={formData.name} onChangeText={(text) => setFormData({ ...formData, name: text })} placeholderTextColor="#999" />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Email *</ThemedText>
            <TextInput style={styles.input} placeholder="your@email.com" value={formData.email} onChangeText={(text) => setFormData({ ...formData, email: text })} keyboardType="email-address" placeholderTextColor="#999" />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Bio</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
            <ThemedText style={styles.characterCount}>{formData.bio.length}/1000</ThemedText>
          </View>

          <TouchableOpacity style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
            <ThemedText style={styles.saveButtonText}>{saving ? "Saving..." : "Save Changes"}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
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
    backgroundColor: "#fff",
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
  saveButton: {
    backgroundColor: "#0ea5a3",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
});
