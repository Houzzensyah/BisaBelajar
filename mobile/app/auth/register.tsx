import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { specialtiesApi } from "../services/api";
import getLocationModule from "../services/optional-location";
import { registerUser } from "../services/authService";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<number[]>([]);
  const [location, setLocation] = useState<{ latitude?: number; longitude?: number } | null>(null);
  const router = useRouter();

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload: any = { name, email, password, password_confirmation: passwordConfirm };
      if (selectedSpecs.length) payload.specialties = selectedSpecs;
      if (location?.latitude && location?.longitude) {
        payload.latitude = location.latitude;
        payload.longitude = location.longitude;
      }
      await registerUser(payload);
      router.replace("/");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Register failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await specialtiesApi.list();
        setSpecialties(res.data || res.data.data || []);
      } catch {
        // ignore
      }
    })();
  }, []);

  const toggleSpecialty = (id: number) => {
    setSelectedSpecs((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const captureLocation = async () => {
    try {
      // Use dynamic import to avoid dependency errors when expo-location is not installed
      const Location = await getLocationModule();
      if (!Location) {
        console.warn("expo-location not available");
        return;
      } // just dont do the reutn of leocahfg id thw wigjgjtje gjhjdrg
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (e) {
      console.warn("Location permission failed", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join BisaBelajar and start learning</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput placeholder="Enter your name" value={name} onChangeText={setName} style={styles.input} placeholderTextColor="#9ca3af" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput placeholder="Enter your email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9ca3af" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput placeholder="Create a password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} placeholderTextColor="#9ca3af" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput placeholder="Confirm your password" value={passwordConfirm} onChangeText={setPasswordConfirm} secureTextEntry style={styles.input} placeholderTextColor="#9ca3af" />
          </View>

          {/* Specialties */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Specialties (optional)</Text>
            <View style={styles.specContainer}>
              {specialties.map((s: any) => (
                <TouchableOpacity key={s.id} onPress={() => toggleSpecialty(s.id)} style={[styles.spec, selectedSpecs.includes(s.id) ? styles.specSelected : null]}>
                  <Text style={{ color: selectedSpecs.includes(s.id) ? "#fff" : "#374151", fontSize: 13 }}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location */}
          <TouchableOpacity style={styles.locationButton} onPress={captureLocation}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{location?.latitude ? `Location detected (${location.latitude.toFixed(4)}, ${location.longitude?.toFixed(4)})` : "Detect my location (optional)"}</Text>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity style={[styles.button, loading ? styles.buttonDisabled : null]} onPress={handleRegister} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Creating Account..." : "Create Account"}</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/login")}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: "#0ea5a3",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 24,
  },
  error: {
    color: "#dc2626",
    marginBottom: 16,
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#fff",
    fontSize: 15,
    color: "#1f2937",
  },
  specContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  spec: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  specSelected: {
    backgroundColor: "#0ea5a3",
    borderColor: "#0ea5a3",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 24,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  locationText: {
    color: "#0ea5a3",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#0ea5a3",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#0ea5a3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginLinkText: {
    color: "#6b7280",
    fontSize: 14,
  },
  loginLink: {
    color: "#0ea5a3",
    fontSize: 14,
    fontWeight: "600",
  },
});
