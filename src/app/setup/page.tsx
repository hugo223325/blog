"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SetupPage() {
  const router = useRouter();
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (newPw.length < 4) { setMsg("密码至少 4 位"); return; }
    if (newPw !== confirm) { setMsg("两次密码不一致"); return; }
    try {
      await api.changePassword(oldPw, newPw);
      api.setPassword(newPw);
      setOk(true);
      setMsg("密码已更新");
    } catch (e: any) {
      setMsg(e.message || "修改失败");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-1 font-sans text-sm text-sage hover:underline mb-8">
        <ArrowLeft size={14} />返回首页
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <Lock size={20} className="text-ink-muted" />
        <h1 className="font-sans text-display text-ink-primary">修改密码</h1>
      </div>

      {ok ? (
        <div className="p-6 rounded-lg bg-sage-soft dark:bg-[#1e2a20] text-center">
          <p className="font-sans text-sm text-sage font-medium">{msg}</p>
          <button onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 font-sans text-sm rounded-md bg-sage text-white hover:opacity-90 transition-opacity">
            回到首页
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-sans text-xs text-ink-muted mb-1">旧密码</label>
            <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)}
              autoFocus className="w-full px-3 py-2 font-sans text-sm border border-page-sand rounded-md bg-page-cream text-ink-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage" />
          </div>
          <div>
            <label className="block font-sans text-xs text-ink-muted mb-1">新密码</label>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
              className="w-full px-3 py-2 font-sans text-sm border border-page-sand rounded-md bg-page-cream text-ink-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage" />
          </div>
          <div>
            <label className="block font-sans text-xs text-ink-muted mb-1">确认新密码</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-3 py-2 font-sans text-sm border border-page-sand rounded-md bg-page-cream text-ink-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage" />
          </div>
          {msg && <p className={`font-sans text-xs ${msg.includes("已更新") ? "text-sage" : "text-terracotta"}`}>{msg}</p>}
          <button type="submit" disabled={!oldPw || !newPw || !confirm}
            className="px-4 py-2 font-sans text-sm rounded-md bg-ink-primary text-page-cream hover:bg-ink-secondary transition-colors duration-200 disabled:opacity-40">
            修改密码
          </button>
        </form>
      )}

      <p className="mt-6 font-sans text-xs text-ink-muted">
        默认密码：blog2026（尽快修改）
      </p>
    </div>
  );
}
