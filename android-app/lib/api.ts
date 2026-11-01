import * as SecureStore from "expo-secure-store";

export const API_BASE_URL = "https://iran-classifieds.vercel.app";
const TOKEN_KEY = "se_sote_session";
export type Listing = {
  id: number | string; title: string; description?: string;
  price_toman?: number | string | null; city?: string; category?: string;
  image_urls?: string[] | null; is_featured?: boolean; status?: string;
  contact_phone?: string; created_at?: string;
};
export type User = { id: number; phone: string; display_name: string | null };
async function token() { return SecureStore.getItemAsync(TOKEN_KEY); }
export async function saveSession(value: string) { await SecureStore.setItemAsync(TOKEN_KEY, value); }
export async function clearSession() { await SecureStore.deleteItemAsync(TOKEN_KEY); }
export async function apiFetch(path: string, init: RequestInit = {}) {
  const session = await token();
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");
  if (session) headers.set("Authorization", "Bearer " + session);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  return fetch(API_BASE_URL + path, { ...init, headers });
}
async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "ارتباط با سه‌سوته انجام نشد.");
  return data as T;
}
export async function getListings(query = ""): Promise<Listing[]> {
  const data = await json<{ listings: Listing[] }>("/api/listings" + (query ? "?q=" + encodeURIComponent(query) : ""));
  return Array.isArray(data.listings) ? data.listings : [];
}
export async function getListing(id: string): Promise<Listing> {
  const data = await json<{ listing: Listing }>("/api/listings/" + encodeURIComponent(id));
  return data.listing;
}
export async function login(phone: string, password: string): Promise<User> {
  const response = await fetch(API_BASE_URL + "/api/account/login", {
    method: "POST", headers: { "Content-Type": "application/json", "x-client-app": "se-sote-mobile" },
    body: JSON.stringify({ phone, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "ورود انجام نشد.");
  if (!data.session_token) throw new Error("توکن ورود دریافت نشد؛ دوباره تلاش کن.");
  await saveSession(data.session_token);
  return data.user;
}
export async function register(phone: string, password: string, display_name: string): Promise<User> {
  const response = await fetch(API_BASE_URL + "/api/account/register", {
    method: "POST", headers: { "Content-Type": "application/json", "x-client-app": "se-sote-mobile" },
    body: JSON.stringify({ phone, password, display_name }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "ثبت‌نام انجام نشد.");
  if (!data.session_token) throw new Error("توکن ورود دریافت نشد؛ دوباره تلاش کن.");
  await saveSession(data.session_token);
  return data.user;
}
export async function getAccount() {
  return json<{ user: User | null; listings: Listing[]; store_builder_requests?: unknown[] }>("/api/account/me");
}
export async function logout() {
  try { await apiFetch("/api/account/logout", { method: "POST" }); }
  finally { await clearSession(); }
}
export async function createListing(input: {
  title: string; description: string; price_toman: string; city: string;
  category: string; contact_phone: string; images: { uri: string; fileName?: string | null; mimeType?: string | null }[];
}) {
  const form = new FormData();
  form.append("title", input.title); form.append("description", input.description);
  form.append("price_toman", input.price_toman); form.append("city", input.city);
  form.append("category", input.category); form.append("contact_phone", input.contact_phone);
  input.images.forEach((image, index) => form.append("images", {
    uri: image.uri, name: image.fileName || "listing-" + index + ".jpg",
    type: image.mimeType || "image/jpeg",
  } as unknown as Blob));
  return json<{ success: boolean; message: string; listing: Listing }>("/api/listings", { method: "POST", body: form });
}
export async function updateListing(id: number, body: Record<string, unknown>) {
  return json<{ success: boolean; message?: string }>("/api/account/listings/" + id, { method: "PATCH", body: JSON.stringify(body) });
}
export async function deleteListing(id: number) {
  return json<{ success: boolean }>("/api/account/listings/" + id, { method: "DELETE" });
}
export async function getWallet() {
  return json<{ balance: number; packages: {code:string;title:string;amount:number}[]; transactions: unknown[]; requests: unknown[] }>("/api/account/wallet");
}
export async function getPromotions() {
  return json<{ requests: unknown[]; balance: number; prices: {featured:number;bump:number} }>("/api/account/promotions");
}
