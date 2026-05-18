import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

/* ── Auth middleware ── */
async function requireAuth(c: any, next: any) {
  const auth = c.req.header("Authorization") || "";
  const token = auth.replace("Bearer ", "");
  const row = await c.env.DB.prepare(
    "SELECT value FROM settings WHERE key = 'password'"
  ).first<{ value: string }>();
  if (!row || token !== row.value) {
    return c.json({ error: "密码错误" }, 401);
  }
  await next();
}

/* ── Health ── */
app.get("/api/health", (c) => c.json({ ok: true }));

/* ═══════════════════════════════════════
   POSTS — blog
   ═══════════════════════════════════════ */

app.get("/api/posts", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM posts ORDER BY created_at DESC"
  ).all();
  const posts = (results || []).map((r: any) => ({
    ...r,
    tags: JSON.parse(r.tags || "[]"),
  }));
  return c.json(posts);
});

app.get("/api/posts/:slug", async (c) => {
  const row = await c.env.DB.prepare(
    "SELECT * FROM posts WHERE slug = ?"
  ).bind(c.req.param("slug")).first();
  if (!row) return c.json({ error: "not found" }, 404);
  return c.json({ ...row, tags: JSON.parse((row as any).tags || "[]") });
});

app.post("/api/posts", requireAuth, async (c) => {
  const body = await c.req.json();
  const slug = body.slug || body.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  const now = new Date().toISOString();
  await c.env.DB.prepare(
    `INSERT INTO posts (slug, title, content, excerpt, tags, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content=excluded.content,
       excerpt=excluded.excerpt, tags=excluded.tags, updated_at=excluded.updated_at`
  ).bind(slug, body.title, body.content, body.excerpt || "", JSON.stringify(body.tags || []), now, now).run();
  return c.json({ slug, ok: true });
});

app.put("/api/posts/:slug", requireAuth, async (c) => {
  const body = await c.req.json();
  const now = new Date().toISOString();
  await c.env.DB.prepare(
    `UPDATE posts SET title=?, content=?, excerpt=?, tags=?, updated_at=? WHERE slug=?`
  ).bind(body.title, body.content, body.excerpt || "", JSON.stringify(body.tags || []), now, c.req.param("slug")).run();
  return c.json({ ok: true });
});

app.delete("/api/posts/:slug", requireAuth, async (c) => {
  await c.env.DB.prepare("DELETE FROM posts WHERE slug = ?").bind(c.req.param("slug")).run();
  return c.json({ ok: true });
});

/* ═══════════════════════════════════════
   DIARY
   ═══════════════════════════════════════ */

app.get("/api/diary", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM diary ORDER BY date DESC"
  ).all();
  return c.json((results || []).map((r: any) => ({
    ...r,
    tags: JSON.parse(r.tags || "[]"),
  })));
});

app.get("/api/diary/:date", async (c) => {
  const row = await c.env.DB.prepare(
    "SELECT * FROM diary WHERE date = ?"
  ).bind(c.req.param("date")).first();
  if (!row) return c.json({ error: "not found" }, 404);
  return c.json({ ...row, tags: JSON.parse((row as any).tags || "[]") });
});

app.post("/api/diary", requireAuth, async (c) => {
  const body = await c.req.json();
  const now = new Date().toISOString();
  await c.env.DB.prepare(
    `INSERT INTO diary (date, content, mood, tags, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET content=excluded.content,
       mood=excluded.mood, tags=excluded.tags, updated_at=excluded.updated_at`
  ).bind(body.date, body.content, body.mood || "", JSON.stringify(body.tags || []), now).run();
  return c.json({ ok: true });
});

app.put("/api/diary/:date", requireAuth, async (c) => {
  const body = await c.req.json();
  const now = new Date().toISOString();
  await c.env.DB.prepare(
    `UPDATE diary SET content=?, mood=?, tags=?, updated_at=? WHERE date=?`
  ).bind(body.content, body.mood || "", JSON.stringify(body.tags || []), now, c.req.param("date")).run();
  return c.json({ ok: true });
});

/* ═══════════════════════════════════════
   TODOS
   ═══════════════════════════════════════ */

app.get("/api/todos", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM todos ORDER BY created_at DESC"
  ).all();
  return c.json(results);
});

app.post("/api/todos", requireAuth, async (c) => {
  const body = await c.req.json();
  const now = new Date().toISOString();
  const id = body.id || crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO todos (id, text, done, priority, created_at, due_date)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(id, body.text, body.done ? 1 : 0, body.priority || "medium", now, body.dueDate || null).run();
  return c.json({ id, ok: true });
});

app.put("/api/todos/:id", requireAuth, async (c) => {
  const body = await c.req.json();
  const sets: string[] = [];
  const vals: any[] = [];
  if (body.text !== undefined) { sets.push("text=?"); vals.push(body.text); }
  if (body.done !== undefined) { sets.push("done=?"); vals.push(body.done ? 1 : 0); }
  if (body.priority !== undefined) { sets.push("priority=?"); vals.push(body.priority); }
  if (body.dueDate !== undefined) { sets.push("due_date=?"); vals.push(body.dueDate); }
  if (sets.length === 0) return c.json({ ok: true });
  vals.push(c.req.param("id"));
  await c.env.DB.prepare(`UPDATE todos SET ${sets.join(",")} WHERE id=?`).bind(...vals).run();
  return c.json({ ok: true });
});

app.delete("/api/todos/:id", requireAuth, async (c) => {
  await c.env.DB.prepare("DELETE FROM todos WHERE id = ?").bind(c.req.param("id")).run();
  return c.json({ ok: true });
});

/* ═══════════════════════════════════════
   SCHEDULE
   ═══════════════════════════════════════ */

app.get("/api/schedule", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM schedule ORDER BY date ASC, time ASC"
  ).all();
  return c.json(results);
});

app.post("/api/schedule", requireAuth, async (c) => {
  const body = await c.req.json();
  const now = new Date().toISOString();
  const id = body.id || crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO schedule (id, title, date, time, duration, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, body.title, body.date, body.time || "09:00", body.duration || 60, body.notes || "", now).run();
  return c.json({ id, ok: true });
});

app.delete("/api/schedule/:id", requireAuth, async (c) => {
  await c.env.DB.prepare("DELETE FROM schedule WHERE id = ?").bind(c.req.param("id")).run();
  return c.json({ ok: true });
});

/* ═══════════════════════════════════════
   WEIGHT
   ═══════════════════════════════════════ */

app.get("/api/weight", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM weight ORDER BY date DESC"
  ).all();
  return c.json(results);
});

app.post("/api/weight", requireAuth, async (c) => {
  const body = await c.req.json();
  const now = new Date().toISOString();
  const id = body.id || crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO weight (id, date, weight, note, created_at) VALUES (?, ?, ?, ?, ?)`
  ).bind(id, body.date, body.weight, body.note || "", now).run();
  return c.json({ id, ok: true });
});

app.delete("/api/weight/:id", requireAuth, async (c) => {
  await c.env.DB.prepare("DELETE FROM weight WHERE id = ?").bind(c.req.param("id")).run();
  return c.json({ ok: true });
});

/* ═══════════════════════════════════════
   SETTINGS
   ═══════════════════════════════════════ */

app.get("/api/settings", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT key, value FROM settings WHERE key != 'password'"
  ).all();
  const obj: Record<string, string> = {};
  for (const r of results || []) {
    obj[(r as any).key] = (r as any).value;
  }
  return c.json(obj);
});

app.put("/api/settings", requireAuth, async (c) => {
  const body = await c.req.json();
  for (const [key, value] of Object.entries(body)) {
    if (key === "password") continue; // password handled separately
    await c.env.DB.prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value=excluded.value`
    ).bind(key, String(value)).run();
  }
  return c.json({ ok: true });
});

app.put("/api/settings/password", async (c) => {
  const body = await c.req.json();
  const row = await c.env.DB.prepare(
    "SELECT value FROM settings WHERE key = 'password'"
  ).first<{ value: string }>();
  if (row && row.value && body.oldPassword !== row.value) {
    return c.json({ error: "旧密码错误" }, 403);
  }
  await c.env.DB.prepare(
    `INSERT INTO settings (key, value) VALUES ('password', ?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`
  ).bind(body.newPassword).run();
  return c.json({ ok: true });
});

app.post("/api/auth", async (c) => {
  const body = await c.req.json();
  const row = await c.env.DB.prepare(
    "SELECT value FROM settings WHERE key = 'password'"
  ).first<{ value: string }>();
  if (!row || body.password === row.value) {
    return c.json({ ok: true, token: body.password });
  }
  return c.json({ error: "密码错误" }, 401);
});

/* ═══════════════════════════════════════
   IMAGES — R2 (待 R2 创建后启用)
   ═══════════════════════════════════════ */
// TODO: 创建 R2 bucket 后取消注释

export default app;
