import axios from "axios";
import { getToken, removeToken } from "./auth";
import Constants from "expo-constants";
import { Platform } from "react-native";

function defaultApiBase() {
  // Pre-define manifest from Constants to avoid ReferenceError
  const manifest: any = (Constants as any).manifest || (Constants as any).expoConfig || null;
  // Priority: env -> expo config extra -> manifest debugger host -> emulator defaults
  if (process.env.API_BASE_URL) {
    if (typeof __DEV__ !== "undefined" && __DEV__) console.debug("[api] using process.env.API_BASE_URL");
    return process.env.API_BASE_URL;
  }
  if (manifest?.extra?.API_BASE_URL) {
    if (typeof __DEV__ !== "undefined" && __DEV__) console.debug("[api] using expo extra API_BASE_URL from manifest");
    return manifest.extra.API_BASE_URL;
  }
  if ((Constants as any).expoConfig?.extra?.API_BASE_URL) {
    if (typeof __DEV__ !== "undefined" && __DEV__) console.debug("[api] using expo extra API_BASE_URL from expoConfig");
    return (Constants as any).expoConfig.extra.API_BASE_URL;
  }

  // Try to infer from Expo dev tools host (debuggerHost = "host:port")
  // fallback: try to read debuggerHost from manifest if available
  const debuggerHost = manifest?.debuggerHost;
  if (debuggerHost) {
    const host = debuggerHost.split(":")[0];
    return `http://${host}:8000/api`;
  }

  // Emulators / simulators defaults
  if (Platform.OS === "android") return "http://10.0.2.2:8000/api";
  if (Platform.OS === "ios") return "http://127.0.0.1:8000/api";
  // default to local
  return "http://localhost:8000/api";
}

export const API_BASE_URL = process.env.API_BASE_URL || defaultApiBase();

const client = axios.create({ baseURL: API_BASE_URL });
// Debug only: remove or use console.debug to avoid noisy logs in production
if (typeof __DEV__ !== "undefined" && __DEV__) console.debug("API base URL:", API_BASE_URL);

client.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    // log error and if token expired/unauthorized, remove token
    // Unauthorized: clear token and return original error
    if (err?.response?.status === 401) {
      await removeToken();
    }
    // Network errors that don't have response: log helpful context
    if (!err?.response) {
      console.warn("[api] network error", {
        message: err?.message,
        code: err?.code,
        baseURL: API_BASE_URL,
      });
    }
    return Promise.reject(err);
  }
);

export type Skill = {
  id: number;
  user_id: number;
  name: string;
  category?: string | null;
  description?: string | null;
};

export const auth = {
  register: (payload: { name: string; email: string; password: string; password_confirmation: string; latitude?: number; longitude?: number; specialties?: number[] }) => client.post("/register", payload),
  login: (payload: { email: string; password: string }) => client.post("/login", payload),
  me: () => client.get("/me"),
  updateProfile: (payload: { name?: string; email?: string; bio?: string; latitude?: number; longitude?: number }) => client.put("/me", payload),
  uploadProfilePicture: (formData: FormData) => client.post("/me/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } }),
};

export const skills = {
  list: (params?: any) =>
    client.get("/skills", { params }).catch((err) => {
      throw err;
    }),
  create: (payload: Partial<Skill>) => client.post("/skills", payload),
  get: (id: number) => client.get(`/skills/${id}`),
  update: (id: number, payload: Partial<Skill>) => client.put(`/skills/${id}`, payload),
  delete: (id: number) => client.delete(`/skills/${id}`),
};

export const swaps = {
  list: (params?: any) => client.get("/swaps", { params }),
  create: (payload: any) => client.post("/swaps", payload),
  accept: (id: number) => client.post(`/swaps/${id}/accept`),
  reject: (id: number) => client.post(`/swaps/${id}/reject`),
};

export const courses = {
  list: () => client.get("/courses"),
  create: (payload: any) => client.post("/courses", payload),
  show: (id: number) => client.get(`/courses/${id}`),
  enroll: (id: number) => client.post(`/courses/${id}/enroll`),
};

export const messages = {
  list: (params?: any) => client.get("/messages", { params }),
  send: (payload: any) => client.post("/messages", payload),
  delete: (id: number) => client.delete(`/messages/${id}`),
};

export const meetings = {
  list: () => client.get("/meetings"),
  create: (payload: any) => client.post("/meetings", payload),
};

export const posts = {
  list: (params?: any) => client.get("/posts", { params }),
  create: (payload: any) => client.post("/posts", payload),
  show: (id: number) => client.get(`/posts/${id}`),
  delete: (id: number) => client.delete(`/posts/${id}`),
};

export const usersApi = {
  get: (id: number) => client.get(`/users/${id}`),
};

export const search = {
  query: (q: string, params?: any) => client.get("/search", { params: { query: q, ...params } }),
};

export const specialtiesApi = {
  list: () => client.get("/specialties"),
};

export const callsApi = {
  create: (payload: { callee_id: number; meeting_id?: number }) => client.post("/calls", payload),
  accept: (id: number) => client.post(`/calls/${id}/accept`),
  decline: (id: number) => client.post(`/calls/${id}/decline`),
  end: (id: number) => client.post(`/calls/${id}/end`),
  show: (id: number) => client.get(`/calls/${id}`),
};

export default client;
