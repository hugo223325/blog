export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // CORS headers
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    };

    if (method === "OPTIONS") return new Response(null, { status: 204, headers });

    // JSON helpers
    const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
    const body = () => req.json().catch(() => ({}));
    const param = (n) => path.split("/")[n];
    // Beijing time (UTC+8)
    const bjNow = () => {
      const d = new Date();
      d.setHours(d.getHours() + 8);
      return d.toISOString().replace("Z", "+08:00");
    };
    // Safe slug — never empty, avoids Chinese chars being stripped
    const makeSlug = (title) => {
      const base = title || "untitled";
      // Try to extract alphanumeric + Chinese chars, join with dash
      const cleaned = base.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9一-鿿\-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "") || "post";
      return cleaned.slice(0, 60) + "-" + Date.now().toString(36);
    };

    // Auth
    async function auth() {
      const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
      const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'password'").first();
      return row && token === row.value;
    }

    try {
      // ── Health ──
      if (path === "/api/health" && method === "GET") return json({ ok: true });

      // ── Auth ──
      if (path === "/api/auth" && method === "POST") {
        const b = await body();
        const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'password'").first();
        if (!row || b.password === row.value) return json({ ok: true, token: b.password });
        return json({ error: "密码错误" }, 401);
      }

      // ── Posts ──
      if (path === "/api/posts" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM posts ORDER BY created_at DESC").all();
        return json((results || []).map(r => ({ ...r, tags: JSON.parse(r.tags || "[]") })));
      }

      if (path.startsWith("/api/posts/") && method === "GET") {
        const slug = param(3);
        const row = await env.DB.prepare("SELECT * FROM posts WHERE slug = ?").bind(slug).first();
        if (!row) return json({ error: "not found" }, 404);
        return json({ ...row, tags: JSON.parse((row.tags || "[]")) });
      }

      if (path === "/api/posts" && method === "POST") {
        if (!(await auth())) return json({ error: "密码错误" }, 401);
        const b = await body();
        const slug = b.slug || makeSlug(b.title);
        const now = bjNow();
        await env.DB.prepare("INSERT INTO posts (slug,title,content,excerpt,tags,created_at,updated_at) VALUES (?,?,?,?,?,?,?)").bind(slug, b.title, b.content, b.excerpt||"", JSON.stringify(b.tags||[]), now, now).run();
        return json({ slug, ok: true });
      }

      if (path.startsWith("/api/posts/") && method === "PUT") {
        if (!(await auth())) return json({ error: "密码错误" }, 401);
        const slug = param(3);
        const b = await body();
        const now = bjNow();
        await env.DB.prepare("UPDATE posts SET title=?,content=?,excerpt=?,tags=?,updated_at=? WHERE slug=?").bind(b.title, b.content, b.excerpt||"", JSON.stringify(b.tags||[]), now, slug).run();
        return json({ ok: true });
      }

      if (path.startsWith("/api/posts/") && method === "DELETE") {
        if (!(await auth())) return json({ error: "密码错误" }, 401);
        await env.DB.prepare("DELETE FROM posts WHERE slug = ?").bind(param(3)).run();
        return json({ ok: true });
      }

      // ── Fix empty slugs ──
      if (path === "/api/fix-slugs" && method === "POST") {
        if (!(await auth())) return json({ error: "密码错误" }, 401);
        const { results } = await env.DB.prepare("SELECT slug, title FROM posts WHERE slug = '' OR slug IS NULL").all();
        let count = 0;
        for (const r of results || []) {
          const newSlug = makeSlug(r.title);
          await env.DB.prepare("UPDATE posts SET slug = ? WHERE slug = '' AND title = ?").bind(newSlug, r.title).run();
          count++;
        }
        return json({ fixed: count, message: `修复了 ${count} 篇文章的 slug` });
      }

      // ── Debug ──
      if (path === "/api/debug/posts" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT slug, title, created_at FROM posts ORDER BY created_at DESC LIMIT 10").all();
        const pwRow = await env.DB.prepare("SELECT value FROM settings WHERE key = 'password'").first();
        const postsWithSlugs = (results || []).map(r => ({ slug: r.slug || "(empty!)", title: r.title, created_at: r.created_at }));
        return json({
          totalPosts: results?.length || 0,
          passwordSet: !!pwRow?.value,
          passwordHint: pwRow?.value ? pwRow.value.slice(0, 2) + "***" : "NOT SET",
          posts: postsWithSlugs,
        });
      }

      // ── Tags ──
      if (path === "/api/tags" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT tags FROM posts").all();
        const counts = {};
        for (const r of results || []) {
          const tags = JSON.parse(r.tags || "[]");
          for (const t of tags) {
            if (t) counts[t] = (counts[t] || 0) + 1;
          }
        }
        const list = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
        return json(list);
      }

      // ── Diary ──
      if (path === "/api/diary" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM diary ORDER BY date DESC").all();
        return json((results || []).map(r => ({ ...r, tags: JSON.parse(r.tags || "[]") })));
      }

      if (path.startsWith("/api/diary/") && method === "GET") {
        const date = param(3);
        const row = await env.DB.prepare("SELECT * FROM diary WHERE date = ?").bind(date).first();
        if (!row) return json({ error: "not found" }, 404);
        return json({ ...row, tags: JSON.parse((row.tags || "[]")) });
      }

      if (path === "/api/diary" && method === "POST") {
        if (!(await auth())) return json({ error: "密码错误" }, 401);
        const b = await body();
        const now = bjNow();
        await env.DB.prepare("INSERT INTO diary (date,content,mood,tags,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(date) DO UPDATE SET content=excluded.content,mood=excluded.mood,tags=excluded.tags,updated_at=excluded.updated_at").bind(b.date, b.content, b.mood||"", JSON.stringify(b.tags||[]), now).run();
        return json({ ok: true });
      }

      if (path.startsWith("/api/diary/") && method === "PUT") {
        if (!(await auth())) return json({ error: "密码错误" }, 401);
        const b = await body();
        const now = bjNow();
        await env.DB.prepare("UPDATE diary SET content=?,mood=?,tags=?,updated_at=? WHERE date=?").bind(b.content, b.mood||"", JSON.stringify(b.tags||[]), now, param(3)).run();
        return json({ ok: true });
      }

      // ── Todos ──
      if (path === "/api/todos" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM todos ORDER BY created_at DESC").all();
        return json(results);
      }

      if (path === "/api/todos" && method === "POST") {
        if (!(await auth())) return json({ error: "密码错误" }, 401);
        const b = await body();
        const id = b.id || crypto.randomUUID();
        await env.DB.prepare("INSERT INTO todos (id,text,done,priority,created_at,due_date) VALUES (?,?,?,?,?,?)").bind(id, b.text, b.done?1:0, b.priority||"medium", bjNow(), b.dueDate||null).run();
        return json({ id, ok: true });
      }

      if (path.startsWith("/api/todos/") && method === "PUT") {
        if (!(await auth())) return json({ error: "密码错误" }, 401);
        const b = await body();
        const sets = [], vals = [];
        if (b.text !== undefined) { sets.push("text=?"); vals.push(b.text); }
        if (b.done !== undefined) { sets.push("done=?"); vals.push(b.done?1:0); }
        if (b.priority !== undefined) { sets.push("priority=?"); vals.push(b.priority); }
        if (b.dueDate !== undefined) { sets.push("due_date=?"); vals.push(b.dueDate); }
        if (sets.length) {
          vals.push(param(3));
          await env.DB.prepare(`UPDATE todos SET ${sets.join(",")} WHERE id=?`).bind(...vals).run();
        }
        return json({ ok: true });
      }

      if (path.startsWith("/api/todos/") && method === "DELETE") {
        if (!(await auth())) return json({ error: "密码错误" }, 401);
        await env.DB.prepare("DELETE FROM todos WHERE id = ?").bind(param(3)).run();
        return json({ ok: true });
      }

      // ── Schedule ──
      if (path === "/api/schedule" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM schedule ORDER BY date ASC, time ASC").all();
        return json(results);
      }

      if (path === "/api/schedule" && method === "POST") {
        if (!(await auth())) return json({ error: "密码错误" }, 401);
        const b = await body();
        const id = b.id || crypto.randomUUID();
        await env.DB.prepare("INSERT INTO schedule (id,title,date,time,duration,notes,created_at) VALUES (?,?,?,?,?,?,?)").bind(id, b.title, b.date, b.time||"09:00", b.duration||60, b.notes||"", bjNow()).run();
        return json({ id, ok: true });
      }

      if (path.startsWith("/api/schedule/") && method === "DELETE") {
        if (!(await auth())) return json({ error: "密码错误" }, 401);
        await env.DB.prepare("DELETE FROM schedule WHERE id = ?").bind(param(3)).run();
        return json({ ok: true });
      }

      // ── Weight ──
      if (path === "/api/weight" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM weight ORDER BY date DESC").all();
        return json(results);
      }

      if (path === "/api/weight" && method === "POST") {
        if (!(await auth())) return json({ error: "密码错误" }, 401);
        const b = await body();
        const id = b.id || crypto.randomUUID();
        await env.DB.prepare("INSERT INTO weight (id,date,weight,note,created_at) VALUES (?,?,?,?,?)").bind(id, b.date, b.weight, b.note||"", bjNow()).run();
        return json({ id, ok: true });
      }

      if (path.startsWith("/api/weight/") && method === "DELETE") {
        if (!(await auth())) return json({ error: "密码错误" }, 401);
        await env.DB.prepare("DELETE FROM weight WHERE id = ?").bind(param(3)).run();
        return json({ ok: true });
      }

      // ── Settings ──
      if (path === "/api/settings" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT key, value FROM settings WHERE key != 'password'").all();
        const obj = {};
        for (const r of results || []) obj[r.key] = r.value;
        return json(obj);
      }

      if (path === "/api/settings" && method === "PUT") {
        if (!(await auth())) return json({ error: "密码错误" }, 401);
        const b = await body();
        for (const [key, value] of Object.entries(b)) {
          if (key === "password") continue;
          await env.DB.prepare("INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(key, String(value)).run();
        }
        return json({ ok: true });
      }

      if (path === "/api/settings/password" && method === "PUT") {
        const b = await body();
        const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'password'").first();
        if (row && row.value && b.oldPassword !== row.value) return json({ error: "旧密码错误" }, 403);
        await env.DB.prepare("INSERT INTO settings (key,value) VALUES ('password',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(b.newPassword).run();
        return json({ ok: true });
      }

    } catch (e) {
      return json({ error: e.message || "Server error" }, 500);
    }

    // Fall through — serve static assets
    return env.ASSETS.fetch(req);
  }
};
