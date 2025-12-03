import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "bisa_belajar_token";

export async function saveToken(token: string) {
  if (Platform.OS !== "web") {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS !== "web") {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function removeToken() {
  if (Platform.OS !== "web") {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}
