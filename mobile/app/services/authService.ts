import { auth as apiAuth } from "./api";
import { saveToken, getToken, removeToken } from "./auth";

export async function registerUser(payload: { name: string; email: string; password: string; password_confirmation: string; latitude?: number; longitude?: number; specialties?: number[] }) {
  const res = await apiAuth.register(payload);
  const token = res?.data?.token || res?.data?.data?.token;
  if (token) await saveToken(token);
  return res;
}

export async function loginUser(payload: { email: string; password: string }) {
  const res = await apiAuth.login(payload);
  const token = res?.data?.token || res?.data?.data?.token;
  if (token) await saveToken(token);
  return res;
}

export { saveToken, getToken, removeToken };
