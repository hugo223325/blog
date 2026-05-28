const BASE = ""; // Same domain — Pages Functions handle /api/*

function getAuth(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("blog-password") || "";
}

export function setPassword(pw: string) {
  sessionStorage.setItem("blog-password", pw);
}

export function clearPassword() {
  sessionStorage.removeItem("blog-password");
}

export function getPassword(): string {
  return getAuth();
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = false
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body) headers["Content-Type"] = "application/json";
  if (auth) {
    const pw = getAuth();
    if (pw) headers["Authorization"] = `Bearer ${pw}`;
  }
  // Cache-busting for GET requests to avoid CDN stale cache
  const url = method === "GET" && !path.includes("?")
    ? `${BASE}${path}?_t=${Date.now()}`
    : `${BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    // 401 → clear stale password & trigger re-auth
    if (res.status === 401 && auth) {
      clearPassword();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth-needed"));
      }
    }
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "请求失败");
  }
  return res.json();
}

// ── Auth ──
export async function login(password: string) {
  const data = await request<{ ok: boolean; token?: string }>(
    "POST",
    "/api/auth",
    { password }
  );
  if (data.ok) setPassword(password);
  return data.ok;
}

// ── Posts ──
export function getPosts() {
  return request<any[]>("GET", "/api/posts");
}

export function getPost(slug: string) {
  return request<any>("GET", `/api/posts/${slug}`);
}

export function savePost(post: { slug?: string; title: string; content: string; excerpt?: string; tags?: string[] }) {
  return request<any>("POST", "/api/posts", post, true);
}

export function updatePost(slug: string, post: { title: string; content: string; excerpt?: string; tags?: string[] }) {
  return request<any>("PUT", `/api/posts/${slug}`, post, true);
}

export function deletePost(slug: string) {
  return request<any>("DELETE", `/api/posts/${slug}`, null, true);
}

export function getTags() {
  return request<{ name: string; count: number }[]>("GET", "/api/tags");
}

export function fixSlugs() {
  return request<{ fixed: number; message: string }>("POST", "/api/fix-slugs", {}, true);
}

// ── Diary ──
export function getDiaryEntries() {
  return request<any[]>("GET", "/api/diary");
}

export function getDiaryEntry(date: string) {
  return request<any>("GET", `/api/diary/${date}`);
}

export function saveDiary(entry: { date: string; content: string; mood?: string; tags?: string[] }) {
  return request<any>("POST", "/api/diary", entry, true);
}

export function updateDiary(date: string, entry: { content: string; mood?: string; tags?: string[] }) {
  return request<any>("PUT", `/api/diary/${date}`, entry, true);
}

// ── Todos ──
export function getTodos() {
  return request<any[]>("GET", "/api/todos");
}

export function createTodo(todo: { id?: string; text: string; priority?: string; dueDate?: string }) {
  return request<{ id: string }>("POST", "/api/todos", todo, true);
}

export function updateTodo(id: string, updates: Record<string, unknown>) {
  return request<any>("PUT", `/api/todos/${id}`, updates, true);
}

export function deleteTodo(id: string) {
  return request<any>("DELETE", `/api/todos/${id}`, null, true);
}

// ── Schedule ──
export function getSchedule() {
  return request<any[]>("GET", "/api/schedule");
}

export function createSchedule(event: { id?: string; title: string; date: string; time?: string; duration?: number; notes?: string }) {
  return request<{ id: string }>("POST", "/api/schedule", event, true);
}

export function deleteSchedule(id: string) {
  return request<any>("DELETE", `/api/schedule/${id}`, null, true);
}

// ── Weight ──
export function getWeight() {
  return request<any[]>("GET", "/api/weight");
}

export function createWeight(entry: { id?: string; date: string; weight: number; note?: string }) {
  return request<{ id: string }>("POST", "/api/weight", entry, true);
}

export function deleteWeight(id: string) {
  return request<any>("DELETE", `/api/weight/${id}`, null, true);
}

// ── Settings ──
export function getSettings() {
  return request<Record<string, string>>("GET", "/api/settings");
}

export function updateSettings(settings: Record<string, string>) {
  return request<any>("PUT", "/api/settings", settings, true);
}

export function changePassword(oldPassword: string, newPassword: string) {
  return request<any>("PUT", "/api/settings/password", { oldPassword, newPassword });
}
