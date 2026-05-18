"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import * as api from "@/lib/api";

interface Props {
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function PasswordGate({ onSuccess, onCancel }: Props) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try {
      const ok = await api.login(pw);
      if (ok) {
        onSuccess();
      } else {
        setErr("密码错误");
      }
    } catch {
      setErr("验证失败，检查网络");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-page-cream/90 dark:bg-[#1a1814]/90 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 p-6 rounded-lg bg-page-cream dark:bg-[#1a1814] border border-page-sand dark:border-[#2d2922]">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-ink-muted" />
          <h2 className="font-sans text-sm font-semibold text-ink-primary dark:text-[#e8e0d5]">
            需要密码
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="输入密码"
            autoFocus
            className="px-3 py-2 font-sans text-sm border border-page-sand rounded-md bg-page-cream text-ink-primary placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage"
          />
          {err && <p className="font-sans text-xs text-terracotta">{err}</p>}
          <div className="flex gap-2">
            {onCancel && (
              <button type="button" onClick={onCancel}
                className="flex-1 px-3 py-2 font-sans text-sm rounded-md bg-page-warm text-ink-secondary hover:bg-page-sand transition-colors duration-200">
                取消
              </button>
            )}
            <button type="submit" disabled={!pw.trim()}
              className="flex-1 px-3 py-2 font-sans text-sm rounded-md bg-ink-primary text-page-cream hover:bg-ink-secondary transition-colors duration-200 disabled:opacity-40">
              确认
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
